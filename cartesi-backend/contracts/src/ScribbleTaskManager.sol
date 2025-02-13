// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../lib/coprocessor-base-contract/src/CoprocessorAdapter.sol";

contract ScribbleTaskManager is CoprocessorAdapter {
    // Structs
    struct UserData {
        uint256 globalScore;      // Cumulative score from successful attempts
        uint256 challengesPassed; // Total number of successful validations
        string[] themeHistory;    // History of passed themes
    }

    struct Prediction {
        string class;
        uint256 probability;
    }

    struct NoticeResult {
        bool passed;
        string theme;
        uint256 confidence;
        Prediction[3] predictions;  // Top 3 predictions
    }

    // State variables
    mapping(address => UserData) private userData;
    mapping(bytes32 => NoticeResult) private noticeResults;
    address[] private participants;
    mapping(bytes32 => address) private inputSenders;

    constructor(address _taskIssuerAddress, bytes32 _machineHash)
        CoprocessorAdapter(_taskIssuerAddress, _machineHash)
    {}

    // Debug events
    event Debug_NoticeReceived(
        bytes32 indexed payloadHash,
        bytes notice,
        string message
    );

    event Debug_DecodingSuccess(
        uint256 result,
        string theme,
        uint256 classesLength,
        uint256 probabilitiesLength
    );

    event Debug_UserUpdate(
        address indexed user,
        bool passed,
        uint256 newScore,
        uint256 totalPassed
    );

    function runExecution(bytes calldata input) external {
        // Store sender before calling coprocessor
        bytes32 inputHash = keccak256(input);
        inputSenders[inputHash] = msg.sender;
        callCoprocessor(input);
    }

    function handleNotice(bytes32 payloadHash, bytes memory notice) internal override {
        // Get original sender from our mapping
        address user = inputSenders[payloadHash];
        require(user != address(0), "Input sender not found");

        emit Debug_NoticeReceived(payloadHash, notice, "Notice received, starting decode");

        try this.decodeNoticeData(notice) returns (
            uint256 result, 
            string memory theme, 
            string[] memory classes, 
            uint256[] memory probabilities
        ) {
            emit Debug_DecodingSuccess(
                result,
                theme,
                classes.length,
                probabilities.length
            );

            bool passed = result > 0;
            uint256 confidence = result;
            
            // Validate array lengths
            require(classes.length >= 3 && probabilities.length >= 3, "Invalid prediction arrays");
            
            // Create a new NoticeResult in storage
            NoticeResult storage newResult = noticeResults[payloadHash];
            newResult.passed = passed;
            newResult.theme = theme;
            newResult.confidence = confidence;

            // Store predictions
            for(uint i = 0; i < 3; i++) {
                newResult.predictions[i].class = classes[i];
                newResult.predictions[i].probability = probabilities[i];
            }
            
            UserData storage userData_ = userData[user];
            
            // Add user to participants array if first time
            if (userData_.challengesPassed == 0) {
                participants.push(user);
            }
            
            if (passed) {
                userData_.challengesPassed++;
                userData_.themeHistory.push(theme);
                
                // For first challenge, set score directly
                if (userData_.challengesPassed == 1) {
                    userData_.globalScore = confidence;
                } else {
                    // For subsequent challenges, take average
                    userData_.globalScore = (userData_.globalScore + confidence) / 2;
                }

                emit Debug_UserUpdate(
                    user,
                    passed,
                    userData_.globalScore,
                    userData_.challengesPassed
                );
            }

            // Clean up mapping
            delete inputSenders[payloadHash];
            emit NoticeReceived(payloadHash, user, notice);    

        } catch Error(string memory reason) {
            // Catch specific error messages
            emit Debug_NoticeReceived(payloadHash, notice, string(abi.encodePacked("Decode failed with: ", reason)));
            revert(reason);
        } catch {
            // Catch any other errors
            emit Debug_NoticeReceived(payloadHash, notice, "Decode failed with unknown error");
            revert("Failed to decode notice data");
        }
    }

    // Helper function to decode notice data
    function decodeNoticeData(bytes memory notice) external pure returns (
        uint256 result,
        string memory theme,
        string[] memory classes,
        uint256[] memory probabilities
    ) {
        return abi.decode(notice, (uint256, string, string[], uint256[]));
    }

    // Getter Functions
    function getNoticeResult(bytes32 payloadHash) external view returns (
        bool passed, 
        string memory theme,
        uint256 confidence,
        Prediction[3] memory predictions
    ) {
        NoticeResult memory result = noticeResults[payloadHash];
        return (result.passed, result.theme, result.confidence, result.predictions);
    }

    function getLeaderboard() external view returns (
        address[] memory addresses, 
        uint256[] memory scores, 
        uint256[] memory passed
    ) {
        uint256 length = participants.length;
        addresses = new address[](length);
        scores = new uint256[](length);
        passed = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            address participant = participants[i];
            addresses[i] = participant;
            scores[i] = userData[participant].globalScore;
            passed[i] = userData[participant].challengesPassed;
        }
        return (addresses, scores, passed);
    }

    function getUserData(address user) external view returns (
        uint256 globalScore,
        uint256 challengesPassed,
        string[] memory themeHistory
    ) {
        UserData memory data = userData[user];
        return (
            data.globalScore,
            data.challengesPassed,
            data.themeHistory
        );
    }

    event NoticeReceived(
        bytes32 indexed payloadHash, 
        address indexed user,
        bytes notice
    );
}
