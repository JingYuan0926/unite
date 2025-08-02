// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockTRX
 * @notice Mock ERC20 token representing TRX for 1inch LOP integration
 * @dev This token serves as a proxy for TRON (TRX) in cross-chain atomic swaps
 */
contract MockTRX is ERC20 {
    constructor() ERC20("Mock TRON", "MTRX") {
        // Mint initial supply to deployer for testing
        _mint(msg.sender, 1000000 * 10**decimals()); // 1M tokens
    }

    /**
     * @notice Mint new tokens (for testing purposes)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    /**
     * @notice Get token decimals (standard 18)
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
}