import json
import subprocess
import base64
from PIL import Image
import numpy as np
import io
from eth_utils import keccak

def encode_image(image_path):
    """
    Open image and convert to base64
    """
    try:
        # Open and convert image to bytes
        with Image.open(image_path) as img:
            # Convert to grayscale
            img = img.convert('L')
            
            # Save as PNG in memory
            buffer = io.BytesIO()
            img.save(buffer, format='PNG')
            img_bytes = buffer.getvalue()
            print(f"Raw PNG size: {len(img_bytes)} bytes")
        
        # Convert to base64
        img_b64 = base64.b64encode(img_bytes).decode('utf-8')
        print(f"Base64 length: {len(img_b64)} characters")
        
        return img_b64
    
    except Exception as e:
        print(f"Error encoding image: {e}")
        raise

def create_test_payload(img_b64):
    """
    Create payload for the dapp
    """
    payload = {
        "image": img_b64,
        "theme": "cat"
    }
    return json.dumps(payload).encode('utf-8').hex()

def main():
    # Configuration
    caller_address = "0xdbC43Ba45381e02825b14322cDdd15eC4B3164E6"
    
    # Test configurations
    tests = [
        {
            "name": "random",
            "path": "../assets/smiley_face.png"
        }
    ]
    
    # Run tests for each configuration
    for test in tests:
        print(f"\nTesting {test['name']} doodle...")
        try:
            # Encode the image
            img_b64 = encode_image(test['path'])
            print(f"Successfully encoded {test['name']} image")
            
            # Create the payload
            hex_payload = create_test_payload(img_b64)
            
            # Calculate and log payload hash
            payload_hash = f"0x{keccak(hexstr=hex_payload).hex()}"
            print(f"\nPayload Hash (for getters): {payload_hash}")
            
            # Construct the cast command
            cmd = [
                "cast",
                "send",
                "--mnemonic",
                "test test test test test test test test test test test junk",
                "--mnemonic-index",
                "3",
                "--rpc-url",
                "http://localhost:8545",
                caller_address,
                "runExecution(bytes)",
                f"0x{hex_payload}"
            ]
            
            # Execute the command
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            print(f"\nTransaction Hash: {result.stdout.strip()}")
            print(f"Success testing {test['name']}!")
            
            print("\nTo test getters, run:")
            print(f"python test_getters.py {caller_address} {payload_hash}")
            
        except Exception as e:
            print(f"Error testing {test['name']}: {e}")

if __name__ == "__main__":
    main()