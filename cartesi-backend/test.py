import json
import subprocess
import base64
from PIL import Image
import numpy as np
from io import BytesIO

def encode_png(png_path):
    # Open and resize image
    with Image.open(png_path) as img:
        # Convert to grayscale
        img = img.convert('L')
        
        # Save as PNG in memory
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_bytes = buffer.getvalue()
        print(f"Raw PNG size: {len(img_bytes)} bytes")
    
    # Convert directly to base64
    img_b64 = base64.b64encode(img_bytes).decode('utf-8')
    print(f"Base64 length: {len(img_b64)} characters")
    
    return img_b64

def create_test_payload(img_b64, doodle_type="penguin"):
    payload = {
        "compressed_doodle": img_b64,
        "type": doodle_type
    }
    return json.dumps(payload).encode('utf-8').hex()

def main():
    # Configuration
    app_address = "0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e"
    
    # Test configurations
    tests = [
        {
            "type": "penguin",
            "path": "dataset/i_penguin_2.png"
        },
        {
            "type": "circle",
            "path": "dataset/circle_1.png"
        }
    ]
    
    # Run tests for each configuration
    for test in tests:
        print(f"\nTesting {test['type']} doodle...")
        try:
            # Encode the PNG file
            img_b64 = encode_png(test['path'])
            print(f"Successfully encoded {test['type']} image")
            
            # Create the payload with type
            hex_payload = create_test_payload(img_b64, test['type'])
            
            # Construct the cast command
            cmd = [
                "cast",
                "send",
                "--mnemonic",
                "test test test test test test test test test test test junk",
                "--mnemonic-index",
                "0",
                "--rpc-url",
                "http://localhost:8545",
                "0x59b22D57D4f067708AB0c00552767405926dc768",
                "addInput(address,bytes)(bytes32)",
                app_address,
                f"0x{hex_payload}"
            ]
            
            # Execute the command
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            print(f"Success testing {test['type']}!")
            print(result.stdout)
            
        except Exception as e:
            print(f"Error testing {test['type']}: {e}")

if __name__ == "__main__":
    main()