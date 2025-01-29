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
    uint256 blogCount;

    event BlogStored(string title,string ipfsHash,string key);

    function postBlog(string memory title,string memory ipfsHash,string memory key,string memory proof) public {
        blogCount++;
        blogs[blogCount] = Blog(title,ipfsHash,key,proof);
        emit BlogStored(title,ipfsHash,key);
    }

}