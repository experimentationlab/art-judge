# (WIP) Python DApp for Judging Artwork

This is backend for a Cartesi DApp that judges user drawn artwork. It uses python3 to execute the backend application. The application entrypoint is the `dapp.py` file.

### Inputs

The DApp accepts a JSON input with the following format:

```json
{
    "image": "<base64-encoded-png>",
    "theme": "apple"
}
```

- `image`: Base64 encoded PNG of the user's drawing
- `theme`: Target class name from [class_names.txt](./model/class_names.txt)

### Outputs

The DApp outputs an ABI encoded tuple with the following structure:
```solidity
(uint256 result, string theme, string[] classes, uint256[] probabilities)
```

Example response:
```json
{
    "result": 90,              // Probability of expected theme (0-100)
    "theme": "apple",          // The expected theme
    "classes": [
        "apple",               // Top 3 predictions
        "circle",
        "face"
    ],
    "probabilities": [         // Corresponding confidence scores
        90,
        5,
        5
    ]
}
```

The output always contains:
- `result`: The probability (0-100) that the drawing matches the expected theme
- `theme`: The expected theme from the input
- `classes`: Top 3 predicted classes for the drawing
- `probabilities`: Confidence scores for the top 3 predictions

Note: The DApp searches through top 10 predictions to find the expected theme's probability, but only returns the top 3 predictions for context.

## Running the backend

This guide uses `cartesi-coprocessor` CLI to build and publish the backend machine. Follow docs [here](https://docs.mugen.builders/cartesi-co-processor-tutorial/installation) to install the CLI and pre-requisites.

Before you build the backend, make sure coprocessor devnet is running otherwise run the following command in a separate terminal:

```bash
cartesi-coprocessor start-devnet
```

Inside the `cartesi-backend` directory, run the following command to build and publish the backend machine:

```bash
cartesi-coprocessor publish --network devnet
```

Get the machine hash from the output of the above command and use it in the `contracts` directory to deploy the `ScribbleTaskManager` contract.

Inside the `contracts` directory, run the following command to deploy the contract:

```bash
cartesi-coprocessor deploy --contract-name ScribbleTaskManager --network devnet --constructor-args <task_issuer> <machine_hash>
```
To get task issuer address for above command, run:
```bash
cartesi-coprocessor address-book
```

Awesome! Now you can use the contract function `runExecution()` to issue tasks to the DApp.

## Testing

### Send Input JSON
Navigate to the `tests` directory and edit the `test_input.py`.

- Update `caller_address` with ScribbleTaskManager contract address 
- You can modify the payload with image path and theme
- You can change the sender address in the cast command

After editing, run the following command to test:   
```bash
python3 test_input.py
```
You can check dapp logs in the Docker-Desktop container named `cartesi-coprocessor-operator`.

### Get Output from Contract
Inside the same `tests` directory, you can run the following command to get the output from the contract:
```bash
python3 test_getters.py <contract_address> <payload_hash>
```

- `contract_address`: ScribbleTaskManager contract address
- `payload_hash`: Hash of the payload sent to the contract logged by `test_input.py` script

## Contract - Public Read Functions

The ScribbleTaskManager contract provides the following view functions to query state:

### `getNoticeResult`
Returns the validation result for a specific task.

```solidity
function getNoticeResult(bytes32 payloadHash) external view returns (
    bool passed,              // Whether the validation passed
    string memory theme,      // Matched theme (empty if failed)
    uint256 confidence,       // Confidence score
    Prediction[3] memory predictions  // Top 3 predictions with scores
)
```

Example response:
```json
{
    "passed": true,
    "theme": "apple",
    "confidence": 95,
    "predictions": [
        {"class": "apple", "probability": 95},
        {"class": "circle", "probability": 3},
        {"class": "face", "probability": 2}
    ]
}
```

### `getUserData`
Returns the performance data for a specific user.

```solidity
function getUserData(address user) external view returns (
    uint256 globalScore,      // Average score from all passed attempts
    uint256 challengesPassed, // Total number of successful validations
    string[] memory themeHistory  // History of passed themes
)
```

Example response:
```json
{
    "global_score": 92,
    "challenges_passed": 3,
    "theme_history": ["apple", "cat", "moon"]
}
```

### `getLeaderboard`
Returns global leaderboard data with user scores and challenges passed.

```solidity
function getLeaderboard() external view returns (
    address[] memory addresses,  // Array of participant addresses
    uint256[] memory scores,     // Array of global scores
    uint256[] memory passed      // Array of challenges passed
)
```

Example response:
```json
{
    "addresses": [
        "0x123...",
        "0x456...",
        "0x789..."
    ],
    "scores": [95, 87, 82],
    "passed": [5, 3, 2]
}
```

Note: The leaderboard arrays are aligned - i.e., `scores[i]` and `passed[i]` correspond to `addresses[i]`.










