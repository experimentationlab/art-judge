from web3 import Web3
import json
import sys
from eth_abi import decode
from hexbytes import HexBytes
from eth_utils import event_abi_to_log_topic

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
    try:
        event_name = event.get('event')
        if not event_name or not event.get('args'):
            print(f"Warning: Malformed event data: {event}")
            return event

        args = event['args']
        
        if event_name == 'NoticeReceived':
            return {
                'event': event_name,
                'payloadHash': HexBytes(args['payloadHash']).hex(),
                'user': args['user'],
                'notice_data': decode_notice_data(args['notice'].hex())
            }
        elif event_name == 'Debug_NoticeReceived':
            return {
                'event': event_name,
                'payloadHash': HexBytes(args['payloadHash']).hex(),
                'message': args['message'],
                'notice_hex': args['notice'].hex()
            }
        elif event_name == 'Debug_DecodingSuccess':
            return {
                'event': event_name,
                'result': args['result'],
                'theme': args['theme'],
                'classesLength': args['classesLength'],
                'probabilitiesLength': args['probabilitiesLength']
            }
        elif event_name == 'Debug_UserUpdate':
            return {
                'event': event_name,
                'user': args['user'],
                'passed': args['passed'],
                'newScore': args['newScore'],
                'totalPassed': args['totalPassed']
            }
        return event
    except Exception as e:
        print(f"Error formatting event: {str(e)}")
        print(f"Raw event data: {event}")
        return event

def get_event_topic(event):
    """Get the topic hash for an event"""
    return event_abi_to_log_topic(event.abi)

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
            # Get event topic hash
            topic = get_event_topic(event)
            
            logs = w3.eth.get_logs({
                'address': contract_address,
                'fromBlock': from_block,
                'toBlock': to_block,
                'topics': [topic]
            })
            
            print(f"\nFetching {event_name} events...")
            for log in logs:
                evt = event.process_log(log)
                formatted = format_event(evt)
                print(f"\nBlock #{log['blockNumber']} - Tx: {log['transactionHash'].hex()}")
                print(json.dumps(formatted, indent=2))
        except Exception as e:
            print(f"Error fetching {event_name} events: {str(e)}")

def get_events_by_user(contract_address, user_address, from_block=0, to_block='latest'):
    """Get all events related to a specific user"""
    contract = w3.eth.contract(address=contract_address, abi=abi)
    
    event = contract.events.NoticeReceived
    topic = get_event_topic(event)
    user_topic = '0x' + '0' * 24 + user_address[2:]
    
    logs = w3.eth.get_logs({
        'address': contract_address,
        'fromBlock': from_block,
        'toBlock': to_block,
        'topics': [topic, None, user_topic]
    })
    
    for log in logs:
        evt = event.process_log(log)
        formatted = format_event(evt)
        print(f"\nBlock #{log['blockNumber']} - Tx: {log['transactionHash'].hex()}")
        print(json.dumps(formatted, indent=2))

def get_events_by_hash(contract_address, payload_hash, from_block=0, to_block='latest'):
    """Get all events related to a specific payloadHash"""
    contract = w3.eth.contract(address=contract_address, abi=abi)
    
    for event_name in ['NoticeReceived', 'Debug_NoticeReceived']:
        event = getattr(contract.events, event_name)
        topic = get_event_topic(event)
        
        logs = w3.eth.get_logs({
            'address': contract_address,
            'fromBlock': from_block,
            'toBlock': to_block,
            'topics': [topic, payload_hash]
        })
        
        for log in logs:
            evt = event.process_log(log)
            formatted = format_event(evt)
            print(f"\nBlock #{log['blockNumber']} - Tx: {log['transactionHash'].hex()}")
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