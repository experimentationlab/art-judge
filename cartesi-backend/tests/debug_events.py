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

def decode_notice_data(hex_data):
    """Decode the notice data using eth-abi"""
    try:
        # Remove '0x' prefix if present
        clean_hex = hex_data[2:] if hex_data.startswith('0x') else hex_data
        # Convert hex string to bytes
        data_bytes = bytes.fromhex(clean_hex)
        # Decode using the same format as the contract
        decoded = decode(
            ['uint256', 'string', 'string[]', 'uint256[]'],
            data_bytes
        )
        return {
            'result': decoded[0],
            'theme': decoded[1],
            'classes': decoded[2],
            'probabilities': decoded[3]
        }
    except Exception as e:
        return f"Failed to decode: {str(e)}"

def format_event(event):
    """Format event data for better readability"""
    event_name = event['event']
    if event_name == 'NoticeReceived':
        return {
            'event': event_name,
            'payloadHash': HexBytes(event['args']['payloadHash']).hex(),
            'user': event['args']['user'],
            'notice_data': decode_notice_data(event['args']['notice'].hex())
        }
    elif event_name == 'Debug_NoticeReceived':
        return {
            'event': event_name,
            'payloadHash': HexBytes(event['args']['payloadHash']).hex(),
            'message': event['args']['message'],
            'notice_hex': event['args']['notice'].hex()
        }
    elif event_name == 'Debug_DecodingSuccess':
        return {
            'event': event_name,
            'result': event['args']['result'],
            'theme': event['args']['theme'],
            'classesLength': event['args']['classesLength'],
            'probabilitiesLength': event['args']['probabilitiesLength']
        }
    elif event_name == 'Debug_UserUpdate':
        return {
            'event': event_name,
            'user': event['args']['user'],
            'passed': event['args']['passed'],
            'newScore': event['args']['newScore'],
            'totalPassed': event['args']['totalPassed']
        }
    return event

def get_events(contract_address, from_block=0, to_block='latest'):
    """Get and decode all events from the contract"""
    contract = w3.eth.contract(address=contract_address, abi=abi)
    
    # List all event names we want to fetch
    event_names = [
        'NoticeReceived',
        'Debug_NoticeReceived',
        'Debug_DecodingSuccess',
        'Debug_UserUpdate'
    ]
    
    for event_name in event_names:
        try:
            event = getattr(contract.events, event_name)
            event_filter = event.create_filter(fromBlock=from_block, toBlock=to_block)
            
            print(f"\nFetching {event_name} events...")
            for evt in event_filter.get_all_entries():
                formatted = format_event(evt)
                print(f"\nBlock #{evt['blockNumber']} - Tx: {evt['transactionHash'].hex()}")
                print(json.dumps(formatted, indent=2))
        except Exception as e:
            print(f"Error fetching {event_name} events: {str(e)}")

def get_events_by_user(contract_address, user_address, from_block=0, to_block='latest'):
    """Get all events related to a specific user"""
    contract = w3.eth.contract(address=contract_address, abi=abi)
    
    # Filter NoticeReceived events by user
    event_filter = contract.events.NoticeReceived.create_filter(
        fromBlock=from_block,
        toBlock=to_block,
        argument_filters={'user': user_address}
    )
    
    for evt in event_filter.get_all_entries():
        formatted = format_event(evt)
        print(f"\nBlock #{evt['blockNumber']} - Tx: {evt['transactionHash'].hex()}")
        print(json.dumps(formatted, indent=2))

def get_events_by_hash(contract_address, payload_hash, from_block=0, to_block='latest'):
    """Get all events related to a specific payloadHash"""
    contract = w3.eth.contract(address=contract_address, abi=abi)
    
    # Filter events by payloadHash
    for event_name in ['NoticeReceived', 'Debug_NoticeReceived']:
        event = getattr(contract.events, event_name)
        event_filter = event.create_filter(
            fromBlock=from_block,
            toBlock=to_block,
            argument_filters={'payloadHash': payload_hash}
        )
        
        for evt in event_filter.get_all_entries():
            formatted = format_event(evt)
            print(f"\nBlock #{evt['blockNumber']} - Tx: {evt['transactionHash'].hex()}")
            print(json.dumps(formatted, indent=2))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python debug_events.py <contract_address> [user_address|payload_hash]")
        sys.exit(1)

    contract_address = sys.argv[1]
    
    if len(sys.argv) == 3:
        filter_value = sys.argv[2]
        if filter_value.startswith('0x') and len(filter_value) == 66:  # Payload hash
            get_events_by_hash(contract_address, filter_value)
        elif filter_value.startswith('0x') and len(filter_value) == 42:  # User address
            get_events_by_user(contract_address, filter_value)
        else:
            print("Invalid filter value. Must be a payload hash or user address")
    else:
        get_events(contract_address) 