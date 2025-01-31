// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract BlogStorage {
    struct Blog {
        string title;
        string ipfsHash;
        string proof;
        string key;
    }

    // Store blogs by id and the address associated with each key
    mapping(uint256 => Blog) public blogs;
    mapping(string => address) public addresses; // Map a key to the real address
    uint256 public blogCount;

    // Events for successful actions
    event NewWriterAdded(string indexed key, address indexed realKey);
    event BlogStored(string indexed title, string indexed ipfsHash, string key);
    event BlogListGot(uint256 blogCount);  // Notify the number of blogs in the system
    event FundsSent(address indexed to, uint256 amount);
    event TipsSent(address indexed to, uint256 amount);

    // Register a new writer (Only allows a unique key per writer)
    function newWriter(string memory key) public {
        // Ensure the key isn't already taken
        require(addresses[key] == address(0), "Writer already registered.");
        
        addresses[key] = msg.sender;
        emit NewWriterAdded(key, msg.sender);
    }

    // Allow tipping a writer for their content
    function tipWriter(string memory key) public payable {
        address realKey = addresses[key];
        require(realKey != address(0), "Invalid address for the given key");

        // Transfer the received funds to the writer's address
        (bool success, ) = realKey.call{value: msg.value}("");
        require(success, "Transfer failed");

        emit TipsSent(realKey, msg.value);
    }

    // Allow paying for blog access and send funds to the writer
    function realBlog(string memory key) public payable {
        address realKey = addresses[key];
        require(realKey != address(0), "Invalid address for the given key");

        // Transfer the received funds to the writer's address
        (bool success, ) = realKey.call{value: msg.value}("");
        require(success, "Transfer failed");

        emit FundsSent(realKey, msg.value);
    }

    // Post a blog with the given details
    function postBlog(string memory title, string memory ipfsHash, string memory key, string memory proof) public {
        blogCount++;
        blogs[blogCount] = Blog(title, ipfsHash, key, proof);
        emit BlogStored(title, ipfsHash, key);
    }

    // Fetch all blogs by returning only titles and IPFS hashes (avoiding returning sensitive data like `proof`)
    function getBlogs() public returns (string[] memory titles, string[] memory ipfsHashes) {
        titles = new string[](blogCount);
        ipfsHashes = new string[](blogCount);

        for (uint256 i = 1; i <= blogCount; i++) {
            titles[i - 1] = blogs[i].title;
            ipfsHashes[i - 1] = blogs[i].ipfsHash;
        }

        emit BlogListGot(blogCount);  // Emit event with the number of blogs
        return (titles, ipfsHashes);
    }

}
