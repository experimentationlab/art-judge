from web3 import Web3
import json
import sys
from eth_abi import decode
from hexbytes import HexBytes

# Connect to your network (update RPC URL as needed)
w3 = Web3(Web3.HTTPProvider('http://localhost:8545'))

# Load contract ABI
with open('../contracts/out/ScribbleTaskManager.sol/ScribbleTaskManager.json', 'r') as f:
    contract_data = json.load(f)
    abi = contract_data['abi']

def test_get_notice_result(contract, payload_hash):
    """Test getNoticeResult function"""
    try:
        result = contract.functions.getNoticeResult(payload_hash).call()
        print("\nNotice Result:")
        print(json.dumps({
            'passed': result[0],
            'theme': result[1],
            'confidence': result[2],
            'predictions': [
                {'class': p[0], 'probability': p[1]} 
                for p in result[3]
            ]
        }, indent=2))
    except Exception as e:
        print(f"Error getting notice result: {str(e)}")

def test_get_leaderboard(contract):
    """Test getLeaderboard function"""
    try:
        addresses, scores, passed = contract.functions.getLeaderboard().call()
        
        print("\nLeaderboard:")
        leaderboard = []
        for i in range(len(addresses)):
            if addresses[i] != '0x' + '0'*40:  # Skip zero addresses
                leaderboard.append({
                    'address': addresses[i],
                    'score': scores[i],
                    'challenges_passed': passed[i]
                })
        
        # Sort by score descending
        leaderboard.sort(key=lambda x: x['score'], reverse=True)
        print(json.dumps(leaderboard, indent=2))
    except Exception as e:
        print(f"Error getting leaderboard: {str(e)}")

def test_get_user_data(contract, user_address):
    """Test getUserData function"""
    try:
        score, passed, themes = contract.functions.getUserData(user_address).call()
        
        print(f"\nUser Data for {user_address}:")
        print(json.dumps({
            'global_score': score,
            'challenges_passed': passed,
            'theme_history': themes
        }, indent=2))
    except Exception as e:
        print(f"Error getting user data: {str(e)}")

def main(contract_address, payload_hash=None, user_address=None):
    """Test all getter functions"""
    contract = w3.eth.contract(address=contract_address, abi=abi)
    
    print("Testing ScribbleTaskManager Getter Functions")
    print("==========================================")
    
    # Test getLeaderboard
    test_get_leaderboard(contract)
    
    # Test getNoticeResult if payload_hash provided
    if payload_hash:
        test_get_notice_result(contract, payload_hash)
    
    # Test getUserData if user_address provided
    if user_address:
        test_get_user_data(contract, user_address)
    
    # If no specific user provided, get data for all users from leaderboard
    elif not user_address:
        try:
            addresses, _, _ = contract.functions.getLeaderboard().call()
            for addr in addresses:
                if addr != '0x' + '0'*40:  # Skip zero addresses
                    test_get_user_data(contract, addr)
        except Exception as e:
            print(f"Error getting all users data: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python test_getters.py <contract_address> [payload_hash] [user_address]")
        sys.exit(1)

    contract_address = sys.argv[1]
    payload_hash = sys.argv[2] if len(sys.argv) > 2 else None
    user_address = sys.argv[3] if len(sys.argv) > 3 else None
    
    main(contract_address, payload_hash, user_address) 