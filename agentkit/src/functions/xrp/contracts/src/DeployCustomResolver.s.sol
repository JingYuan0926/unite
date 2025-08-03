// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Script } from "forge-std/Script.sol";
import { console } from "forge-std/console.sol";
import "../src/CustomLimitOrderResolver.sol";

contract DeployCustomResolver is Script {
    address public constant LOP = 0x111111125421cA6dc452d289314280a0f8842A65; // 1inch LOP on all chains
    
    function run() external {
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");
        
        vm.startBroadcast();
        
        // Deploy CustomLimitOrderResolver
        CustomLimitOrderResolver resolver = new CustomLimitOrderResolver(
            LOP,        // _limitOrderProtocol
            deployer    // _owner
        );
        
        vm.stopBroadcast();

        console.log("CustomLimitOrderResolver deployed at:", address(resolver));
        console.log("Owner:", deployer);
        console.log("LOP Address:", LOP);
    }
}