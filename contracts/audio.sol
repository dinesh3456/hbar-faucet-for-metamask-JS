// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;



contract Audio {
    address public owner;
    mapping(address => bool) public hasAccess;
    mapping(address => mapping(uint256 => bool)) public hasListened;
    mapping(uint256 => string) public audioUrls; // Store URLs for each audio

    event PaymentReceived(address indexed payer, uint256 amount);
    event AudioPlayed(address indexed listener);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier requirePayment() {
        require(
            msg.value >= 100000, // 0.0001 tinybars = 0.0000000000000001 hba
            "Insufficient payment. Please pay 0.0001 hbar to access the audio."
        );
        _;
    }

    constructor() {
        owner = msg.sender;

        // Set predefined audio URLs during contract deployment
        audioUrls[1] = "https://gateway.pinata.cloud/ipfs/QmYd6QqjAsf1BPGijq4kAmuVXPBbvDRWqyprRdAPzLcXpa";
        audioUrls[2] = "https://gateway.pinata.cloud/ipfs/QmexfW4Vu6qvgudCSjDjPqTAv1ZYjLDrkDsYBeUtdNxkhE";
        audioUrls[3] = "https://gateway.pinata.cloud/ipfs/QmTApCdTVWddkLkJ8PCHADNjDUvcpj1hMhHzTULs3V1CTe";
        audioUrls[4] = "https://gateway.pinata.cloud/ipfs/QmTskujoRo3wiqN1BGsB111aRebdENNgNjJrWwAK6W6FPL";
    }

    receive() external payable {
        emit PaymentReceived(msg.sender, msg.value);
        hasAccess[msg.sender] = true;
    }

    function getHasAccess(address user) external view returns (bool) {
        return hasAccess[user];
    }

    // Function to get the URL of a specific audio
    function getAudioUrl(uint256 audioId) external view returns (string memory) {
        return audioUrls[audioId];
    }

    function payToListen() external payable  {
        emit PaymentReceived(msg.sender, msg.value);
        hasAccess[msg.sender] = true;
        hasListened[msg.sender][1] = false; // Initialize the listened state to false for audioId 1
        hasListened[msg.sender][2] = false; // Initialize the listened state to false for audioId 2
        hasListened[msg.sender][3] = false; // Initialize the listened state to false for audioId 3
        hasListened[msg.sender][4] = false; // Initialize the listened state to false for audioId 4

        // Log additional information about the payment
        emit PaymentDetails(msg.sender, msg.value, block.timestamp);
    }

    function listenToAudio(uint256 audioId) external {
        require(!hasListened[msg.sender][audioId], "You have already listened to the audio.");

        // Log additional information about the audio playback
        emit AudioPlaybackDetails(msg.sender, audioId, block.timestamp);

        // Additional logic to handle the audio URL (e.g., emit an event)
        emit AudioPlayed(msg.sender);

        hasListened[msg.sender][audioId] = true; // Set the listened state to true after listening
    }

    function grantAccess(address user) external onlyOwner {
        hasAccess[user] = true;
    }

    function revokeAccess(address user) external onlyOwner {
        hasAccess[user] = false;
    }

    // Add an event to log audio playback details
    event AudioPlaybackDetails(address indexed listener, uint256 audioId, uint256 timestamp);
    // Add an event to log payment details
    event PaymentDetails(address indexed payer, uint256 amount, uint256 timestamp);
}
