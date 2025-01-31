// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract BlogStorage {
    struct Blog {
        string title;
        string ipfsHash;
        string proof;
        string key;
    }

    mapping(uint256 => Blog) public blogs;
    mapping(string => address) public addresses;
    uint256 blogCount;


    event NewWriterAdded(string key,address realKey);
    event BlogStored(string title,string ipfsHash,string key);
    event BlogListGot();
    event FundsSent(address indexed to, uint256 amount);
    event TipsSent(address indexed to ,uint256 amount);


    function newWriter(string memory key) public {
        addresses[key]=msg.sender;
        emit NewWriterAdded(key,msg.sender);
    }

    function tipWriter(string memory key) public payable {

        address realKey = addresses[key];
        // Ensure the address is valid (non-zero)
        require(realKey != address(0), "Invalid address for the given key");

        // Transfer the received funds to the realKey
        (bool success, ) = realKey.call{value: msg.value}("This is Tip for you");
        require(success, "Transfer failed");

        emit TipsSent(realKey,msg.value);
    }

    function realBlog(string memory key) public payable {

        address realKey = addresses[key];
        // Ensure the address is valid (non-zero)
        require(realKey != address(0), "Invalid address for the given key");

        // Transfer the received funds to the realKey
        (bool success, ) = realKey.call{value: msg.value}("This is for your Blog Access");
        require(success, "Transfer failed");

        emit FundsSent(realKey,msg.value);
    }


    function postBlog(string memory title,string memory ipfsHash,string memory key,string memory proof) public {
        blogCount++;
        blogs[blogCount] = Blog(title,ipfsHash,key,proof);
        emit BlogStored(title,ipfsHash,key);
    }

    function getBlogs() public  returns (string[] memory, string[] memory, string[] memory) {
        string[] memory titles = new string[](blogCount);
        string[] memory ipfsHashes = new string[](blogCount);
        string[] memory keys = new string[](blogCount);

        for (uint256 i = 1; i <= blogCount; i++) {
            titles[i - 1] = blogs[i].title;
            ipfsHashes[i - 1] = blogs[i].ipfsHash;
            keys[i - 1] = blogs[i].key;
        }
        emit BlogListGot();

        return (titles, ipfsHashes, keys);
    }

}