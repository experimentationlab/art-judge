from os import environ
import logging, requests, json, base64
import numpy as np
from PIL import Image
import tflite_runtime.interpreter as tflite
import io
from eth_abi import encode

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)
rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")

def load_and_preprocess_image(base64_data, debug=True):
    """
    Load and preprocess image from base64 data
    """
    try:
        # Decode base64 to bytes
        img_bytes = base64.b64decode(base64_data)
        
        # Open image with PIL and convert to grayscale
        img = Image.open(io.BytesIO(img_bytes)).convert("L")
        if debug:
            logger.info(f"Original image size: {img.size}")

        # Resize to 28x28
        if img.size != (28, 28):
            img = img.resize((28, 28), Image.BILINEAR)
            if debug:
                logger.info(f"Resized image size: {img.size}")

        # Convert to numpy array
        img_np = np.array(img, dtype=np.float32)
        if debug:
            logger.info(f"Numpy array shape: {img_np.shape}")
            logger.info(f"Value range before normalization: {img_np.min():.1f} to {img_np.max():.1f}")

        # Normalize and invert (Quick Draw expects 0=black, 1=white)
        img_np = img_np / 255.0
        img_np = 1.0 - img_np  # Invert the colors
        
        # Enhance contrast by thresholding
        threshold = 0.2
        img_np = np.where(img_np > threshold, 1.0, 0.0).astype(np.float32)
        
        if debug:
            logger.info(f"Value range after normalization: {img_np.min():.3f} to {img_np.max():.3f}")

        # Add batch and channel dimensions
        img_np = np.expand_dims(img_np, axis=0)
        img_np = np.expand_dims(img_np, axis=-1)
        
        if debug:
            logger.info(f"Final shape: {img_np.shape}")
            logger.info(f"Final value range: {img_np.min():.3f} to {img_np.max():.3f}")

        return img_np

    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        raise

def run_inference(interpreter, image_array):
    """
    Run inference using TFLite runtime
    """
    try:
        # Get input and output details
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()
        
        logger.info("Model Input Details:")
        logger.info(f"Shape: {input_details[0]['shape']}")
        logger.info(f"Quantization: {input_details[0].get('quantization', 'None')}")

        # Set the input tensor
        interpreter.set_tensor(input_details[0]['index'], image_array)

        # Run inference
        interpreter.invoke()

        # Get the output tensor
        output_data = interpreter.get_tensor(output_details[0]['index'])
        
        return output_data[0]

    except Exception as e:
        logger.error(f"Error running inference: {e}")
        raise

def get_top_predictions(output_data, class_names_path, top_k=3):
    """
    Get top k predictions from the model output
    """
    try:
        # Get indices of top k predictions
        top_indices = output_data.argsort()[-top_k:][::-1]
        
        # Load class names
        with open(class_names_path, 'r') as f:
            class_names = [line.strip() for line in f.readlines()]
        
        results = []
        for idx in top_indices:
            results.append({
                'class': class_names[idx],
                'probability': float(output_data[idx] * 100)
            })
        
        return results

    except Exception as e:
        logger.error(f"Error getting predictions: {e}")
        raise

def emit_notice(data):
    logger.info("Emitting notice")
    notice_payload = {"payload": data["payload"]}
    
    response = requests.post(rollup_server + "/notice", json=notice_payload)
    if response.status_code in (200, 201):
        logger.info(f"Notice emitted successfully with data: {data}")
    else:
        logger.error(f"Failed to emit notice with data: {data}. Status code: {response.status_code}")

def handle_advance(data):
    logger.info(f"Received advance request data {data}")
    
    try:
        # Decode payload
        payload_hex = data['payload']
        payload_str = bytes.fromhex(payload_hex[2:]).decode('utf-8')
        payload = json.loads(payload_str)
        logger.info(f"Decoded payload: {payload}")
        
        # Extract base64 image and expected class
        base64_image = payload.get("image")
        expected_class = payload.get("theme")
        
        if not base64_image:
            logger.error("No image provided in payload")
            return "reject"
            
        if not expected_class:
            logger.error("No expected class provided in payload")
            return "reject"

        # Load TFLite model
        interpreter = tflite.Interpreter(model_path="model.tflite")
        interpreter.allocate_tensors()

        # Preprocess image
        img_array = load_and_preprocess_image(base64_image)
        
        # Run inference
        output_data = run_inference(interpreter, img_array)
        
        # Get predictions
        results = get_top_predictions(output_data, "class_names.txt")
        
        # Determine pass/fail result
        top_prediction = results[0]
        confidence_threshold = 90.0
        
        final_result = 1 if (
            top_prediction['class'] == expected_class and 
            top_prediction['probability'] >= confidence_threshold
        ) else 0
        
        logger.info(f"Validation result: {final_result} (Expected: {expected_class}, "
                   f"Got: {top_prediction['class']} with {top_prediction['probability']:.2f}% confidence)")
        
        if final_result == 1:
            result = int(top_prediction['probability'])
            theme = top_prediction['class']
        else:
            result = 0
            theme = ""
            
        # Prepare prediction arrays
        prediction_classes = [p['class'] for p in results[:3]]
        prediction_probabilities = [int(p['probability']) for p in results[:3]]
        
        # Verify array lengths match before encoding
        if len(prediction_classes) != 3 or len(prediction_probabilities) != 3:
            # Pad arrays to length 3 if needed
            prediction_classes = (prediction_classes + [""] * 3)[:3]
            prediction_probabilities = (prediction_probabilities + [0] * 3)[:3]

        # ABI encode the data
        encoded_data = encode(
            ['uint256', 'string', 'string[]', 'uint256[]'],
            [result, theme, prediction_classes, prediction_probabilities]
        )
        
        # Convert to hex and emit notice
        hex_data = "0x" + encoded_data.hex()
        emit_notice({"payload": hex_data})
        return "accept"
        
    except Exception as error:
        logger.error(f"Error processing payload: {error}")
        return "reject"

handlers = {
    "advance_state": handle_advance,
}

finish = {"status": "accept"}

while True:
    logger.info("Sending finish")
    response = requests.post(rollup_server + "/finish", json=finish)
    logger.info(f"Received finish status {response.status_code}")
    if response.status_code == 202:
        logger.info("No pending rollup request, trying again")
    else:
        rollup_request = response.json()
        handler = handlers.get(rollup_request["request_type"])
        if handler:
            finish["status"] = handler(rollup_request["data"])
        else:
            logger.error("No handler for request type")
            finish["status"] = "reject"
