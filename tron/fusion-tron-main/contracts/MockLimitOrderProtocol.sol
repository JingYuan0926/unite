// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title MockLimitOrderProtocol
 * @dev A simplified mock implementation of 1inch Limit Order Protocol for testnet testing
 * This implements basic fillOrder functionality for demonstration purposes
 */
contract MockLimitOrderProtocol {
    // Basic reentrancy guard
    bool private _locked;
    
    // Contract owner (for testing compatibility)
    address public owner;

    struct Order {
        uint256 salt;
        address maker;
        address receiver;
        address makerAsset;
        address takerAsset;
        uint256 makingAmount;
        uint256 takingAmount;
        uint256 makerTraits;
    }

    // Events
    event OrderFilled(
        bytes32 indexed orderHash,
        uint256 remaining
    );

    // Storage
    mapping(bytes32 => uint256) public remaining;
    
    // EIP-712 Domain
    bytes32 public constant DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 public constant ORDER_TYPEHASH = keccak256("Order(uint256 salt,address maker,address receiver,address makerAsset,address takerAsset,uint256 makingAmount,uint256 takingAmount,uint256 makerTraits)");
    
    bytes32 public immutable DOMAIN_SEPARATOR;

    constructor() {
        owner = msg.sender;
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            DOMAIN_TYPEHASH,
            keccak256("1inch Limit Order Protocol"),
            keccak256("4"),
            block.chainid,
            address(this)
        ));
    }

    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    /**
     * @dev Fill an order with specified parameters
     * @param order The order struct
     * @param r First 32 bytes of signature
     * @param vs Last 32 bytes of signature (v + s)
     * @param amount Amount to fill
     * @param takerTraits Taker traits (bit flags)
     */
    function fillOrder(
        Order calldata order,
        bytes32 r,
        bytes32 vs,
        uint256 amount,
        uint256 takerTraits
    ) external payable nonReentrant returns (uint256 actualMakingAmount, uint256 actualTakingAmount) {
        // Calculate order hash
        bytes32 orderHash = _hashOrder(order);
        
        // Verify signature
        require(_verifySignature(orderHash, r, vs, order.maker), "Invalid signature");
        
        // Check if order is still valid (basic checks)
        require(order.makingAmount > 0 && order.takingAmount > 0, "Invalid amounts");
        require(remaining[orderHash] == 0, "Order already filled"); // Simple once-only fill for demo
        
        // For simplicity, we'll do a full fill
        actualMakingAmount = order.makingAmount;
        actualTakingAmount = order.takingAmount;
        
        // Mark as filled
        remaining[orderHash] = order.makingAmount - actualMakingAmount;
        
        // Handle transfers (simplified for demo)
        if (order.makerAsset == address(0)) {
            // Maker asset is ETH
            require(address(this).balance >= actualMakingAmount, "Insufficient ETH");
            payable(msg.sender).transfer(actualMakingAmount);
        } else {
            // Maker asset is ERC20 - simplified transfer
            (bool success, ) = order.makerAsset.call(
                abi.encodeWithSignature("transferFrom(address,address,uint256)", order.maker, msg.sender, actualMakingAmount)
            );
            require(success, "Maker asset transfer failed");
        }
        
        if (order.takerAsset == address(0)) {
            // Taker asset is ETH
            require(msg.value >= actualTakingAmount, "Insufficient ETH sent");
            address recipient = order.receiver == address(0) ? order.maker : order.receiver;
            payable(recipient).transfer(actualTakingAmount);
            
            // Refund excess ETH
            if (msg.value > actualTakingAmount) {
                payable(msg.sender).transfer(msg.value - actualTakingAmount);
            }
        } else {
            // Taker asset is ERC20 - simplified transfer
            address recipient = order.receiver == address(0) ? order.maker : order.receiver;
            (bool success, ) = order.takerAsset.call(
                abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, recipient, actualTakingAmount)
            );
            require(success, "Taker asset transfer failed");
        }
        
        emit OrderFilled(orderHash, remaining[orderHash]);
    }

    /**
     * @dev Get bit invalidator for order (compatibility function)
     * @param maker The maker address
     * @param slot The slot number
     * @return Always returns 0 for simplicity in mock
     */
    function bitInvalidatorForOrder(address maker, uint256 slot) external pure returns (uint256) {
        // Suppress unused parameter warnings and always return 0 for mock
        maker; slot;
        return 0;
    }

    /**
     * @dev Hash an order
     */
    function _hashOrder(Order calldata order) internal pure returns (bytes32) {
        return keccak256(abi.encode(
            ORDER_TYPEHASH,
            order.salt,
            order.maker,
            order.receiver,
            order.makerAsset,
            order.takerAsset,
            order.makingAmount,
            order.takingAmount,
            order.makerTraits
        ));
    }

    /**
     * @dev Verify signature
     */
    function _verifySignature(bytes32 orderHash, bytes32 r, bytes32 vs, address maker) internal view returns (bool) {
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, orderHash));
        
        // Extract v and s from vs
        uint8 v = uint8(uint256(vs) >> 255) + 27;
        bytes32 s = bytes32(uint256(vs) & 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
        
        address recovered = ecrecover(digest, v, r, s);
        return recovered == maker && recovered != address(0);
    }

    /**
     * @dev Allow contract to receive ETH
     */
    receive() external payable {}
}