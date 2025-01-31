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
    event BlogListGot();

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