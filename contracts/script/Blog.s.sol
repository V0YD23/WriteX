// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/Blog.sol";

contract DeployBlogStorage is Script {
    function run() public {
        uint256 private_key = vm.envUint("PRIVATE_KEY");
        string memory rpcUrl = vm.envString("RPC_URL");

        vm.startBroadcast(private_key);
        // Deploy the BlogStorage contract
        BlogStorage blogStorage = new BlogStorage();

        vm.stopBroadcast();
        // Log the contract address after deployment
        console.log("BlogStorage deployed at:", address(blogStorage)); 

    }
}