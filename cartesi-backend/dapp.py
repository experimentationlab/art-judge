from os import environ
import logging, requests, json, base64, cv2, numpy as np

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)
rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")

# Load reference vectors
logger.info("Loading reference vectors")
all_penguin_vectors = np.load("./dataset/penguin_bitmap.npy")  # shape (N, 784)
REFERENCE_VECTOR = np.mean(all_penguin_vectors, axis=0)
logger.info("Reference vectors loaded successfully")

def preprocess_image(base64_data):
    logger.info("Preprocessing image")
    try:
        # Decode base64 to bytes
        img_bytes = base64.b64decode(base64_data)
        
        # Convert byte data to numpy array
        nparr = np.frombuffer(img_bytes, np.uint8)
        
        # Decode image using OpenCV
        img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise ValueError("Failed to decode image")
            
        return img
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        raise

def normalize_and_flatten(img):
    """Convert image to normalized flat vector"""
    img_vector = img.astype(np.float32) / 255.0
    return img_vector.flatten()

def cosine_similarity_numpy(vec1, vec2):
    """
    Compute the cosine similarity between two 1D vectors using NumPy.
    Returns a value between 0 and 1 (assuming non-negative normalized vectors).
    """
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    score = dot_product / (norm1 * norm2)
    return max(0.0, min(1.0, score))

def check_circle_accuracy(img):
    """
    Analyze how close the drawing is to a perfect circle using radial analysis.
    Returns a score between 0 and 1 (0% to 100%).
    """
    logger.info("Checking circle accuracy")
    try:
        # Invert threshold for dark drawings on light background
        _, binary = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY_INV)
        
        # Find contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            logger.error("No contours found in image")
            return 0.0
            
        # Get the largest contour
        contour = max(contours, key=cv2.contourArea)
        
        # Validate contour size
        area = cv2.contourArea(contour)
        img_area = img.shape[0] * img.shape[1]
        area_ratio = area / img_area
        
        # If contour is too small or too large relative to image size, reject it
        if area_ratio < 0.01 or area_ratio > 0.95:
            logger.error(f"Invalid contour area ratio: {area_ratio:.3f}")
            return 0.0
        
        # Calculate moments and centroid
        M = cv2.moments(contour)
        if M["m00"] == 0:
            logger.error("Zero contour area")
            return 0.0
            
        cX = int(M["m10"] / M["m00"])
        cY = int(M["m01"] / M["m00"])
        
        # Compute distances and angles from the centroid to each contour point
        distances = []
        angles = []
        for point in contour:
            x, y = point[0]
            dx = x - cX
            dy = y - cY
            dist = np.sqrt(dx*dx + dy*dy)
            angle = np.arctan2(dy, dx)
            distances.append(dist)
            angles.append(angle)
            
        distances = np.array(distances)
        angles = np.array(angles)
        
        # Ensure we have enough points for a meaningful analysis
        if len(distances) < 8:
            logger.error(f"Too few contour points: {len(distances)}")
            return 0.0
        
        # Sort points by angle to analyze radius variation around the shape
        sorted_indices = np.argsort(angles)
        sorted_distances = distances[sorted_indices]
        
        # Compute radius variation score using a more stringent method
        # Calculate variations between each point and the mean radius
        mean_radius = np.mean(sorted_distances)
        radius_deviations = np.abs(sorted_distances - mean_radius) / mean_radius
        radial_score = np.exp(-5 * np.mean(radius_deviations))  # Exponential penalty for deviations
        
        # Aspect ratio score with exponential penalty
        x, y, w, h = cv2.boundingRect(contour)
        raw_aspect = min(w, h) / max(w, h)
        aspect_ratio = np.exp(-5 * (1 - raw_aspect))  # Exponential penalty for non-square shapes
        
        # Area ratio score with stronger penalty
        actual_area = cv2.contourArea(contour)
        ideal_area = np.pi * mean_radius * mean_radius
        raw_area_ratio = min(actual_area, ideal_area) / max(actual_area, ideal_area)
        area_ratio = np.exp(-3 * (1 - raw_area_ratio))
        
        # Circularity score (4πA/P²) with exponential penalty
        perimeter = cv2.arcLength(contour, True)
        if perimeter > 0:
            raw_circularity = 4 * np.pi * actual_area / (perimeter * perimeter)
            circularity = np.exp(-3 * (1 - raw_circularity))
        else:
            circularity = 0
            
        # Combine all metrics with adjusted weights
        weights = {
            'radial': 0.35,    # Reduced slightly
            'aspect': 0.25,    # Increased
            'area': 0.15,      # Reduced
            'circularity': 0.25  # Increased
        }
        
        final_score = (
            weights['radial'] * radial_score +
            weights['aspect'] * aspect_ratio +
            weights['area'] * area_ratio +
            weights['circularity'] * circularity
        )
        
        # Log detailed metrics
        logger.info(f"""Circle metrics (percentages):
            Radial uniformity: {radial_score * 100:.1f}%
            Aspect ratio: {aspect_ratio * 100:.1f}%
            Area ratio: {area_ratio * 100:.1f}%
            Circularity: {circularity * 100:.1f}%
            Final score: {final_score * 100:.1f}%
        """)
        
        return final_score
        
    except Exception as e:
        logger.error(f"Error checking circle accuracy: {e}")
        return 0.0

def score_doodle(img, doodle_type):
    """Score doodle based on type"""
    logger.info(f"Scoring doodle of type: {doodle_type}")
    
    if doodle_type == "circle":
        score = check_circle_accuracy(img)
        message = f"Your circle scored {int(score * 100)}% accuracy."
    
    elif doodle_type == "penguin":
        # Resize to 28x28 for penguin comparison
        img_resized = cv2.resize(img, (28, 28))
        user_vector = normalize_and_flatten(img_resized)
        score = cosine_similarity_numpy(user_vector, REFERENCE_VECTOR)
        message = f"Your penguin scored {int(score * 100)}% similarity to the ideal penguin."
    
    else:
        raise ValueError(f"Unknown doodle type: {doodle_type}")
    
    return score, message

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
    payload_hex = data['payload']
    try:
        payload_str = bytes.fromhex(payload_hex[2:]).decode('utf-8')
        payload = json.loads(payload_str)
        logger.info(f"Decoded payload: {payload}")
        
        # Extract base64 doodle image and type
        base64_doodle = payload.get("compressed_doodle")
        doodle_type = payload.get("type", "penguin")  # default to penguin for backward compatibility
        
        if not base64_doodle:
            logger.error("No doodle provided in payload")
            return "reject"
            
        # Preprocess and score
        img = preprocess_image(base64_doodle)
        score, message = score_doodle(img, doodle_type)
        
        # Prepare output JSON
        output = {
            "score": score,
            "message": message
        }
        
        # Emit output as notice
        output_payload = json.dumps(output)
        emit_notice({"payload": output_payload})
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
