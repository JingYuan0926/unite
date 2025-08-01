Markdown

# Battle Plan: 1:1 TronEscrowFactory Port

**Objective:** To successfully deploy and operate a 1:1 functional equivalent of the complex EVM `EscrowFactory` on the Tron network within a 48-hour timeframe.

**Strategy:** A "Divide and Conquer" approach to isolate, debug, and solve each point of failure systematically.

---

### ## 🎯 Objective 1: Conquer `CREATE2` (Saturday Morning)

**Goal:** Prove that the fundamental `CREATE2` deployment pattern works in isolation on Tron. This is the foundation for the entire project.

**### Step 1.1: Create `MinimalProxy.sol`**
A simple contract that serves as the deployment target.

```solidity
// MinimalProxy.sol
pragma solidity ^0.8.0;

contract MinimalProxy {
    address public implementation;

    constructor(address _implementation) {
        implementation = _implementation;
    }
}
### Step 1.2: Create MinimalFactory.sol
A contract that does nothing but deploy MinimalProxy using CREATE2.

Solidity

// MinimalFactory.sol
pragma solidity ^0.8.0;

import "./MinimalProxy.sol";

contract MinimalFactory {
    event Deployed(address addr, bytes32 salt);

    function deploy(bytes32 salt) public {
        bytes memory bytecode = abi.encodePacked(
            type(MinimalProxy).creationCode,
            abi.encode(address(this)) // Pass an arbitrary address as implementation
        );

        address addr;
        assembly {
            addr := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }

        require(addr != address(0), "Deploy failed");
        emit Deployed(addr, salt);
    }
}
### Task:

Deploy MinimalFactory.

Successfully call the deploy function from an off-chain script (e.g., using TronWeb).

Success is defined as a confirmed transaction that emits the Deployed event.

## 🎯 Objective 2: Tame the Libraries (Saturday Afternoon)
Goal: Isolate and debug the AddressLib and TimelocksLib libraries to understand and fix their incompatibilities with the Tron EVM.

### Step 2.1: Isolate AddressLib
Create a minimal contract to test the failing get function.

Solidity

// TestAddressLib.sol
pragma solidity ^0.8.0;

import "./AddressLib.sol"; // Your specific AddressLib implementation

contract TestAddressLib {
    function testGet(uint256 val) public pure returns (address) {
        return AddressLib.get(val);
    }
}
### Task:

Deploy TestAddressLib.

Call testGet with a uint256 representing an address.

Debug until the function returns the correct address without reverting.

### Step 2.2: Isolate TimelocksLib
Create a minimal contract to test the timelock logic.

Solidity

// TestTimelocksLib.sol
pragma solidity ^0.8.0;

import "./TimelocksLib.sol"; // Your specific TimelocksLib implementation

contract TestTimelocksLib {
    function testTimelocks(uint256 packedData, uint256 timestamp) public pure returns (uint256, uint256) {
        uint256 initialValue = TimelocksLib.get(packedData, TimelocksLib.Stage.DstCancellation);
        uint256 updatedData = TimelocksLib.setDeployedAt(packedData, timestamp);
        return (initialValue, updatedData);
    }
}
### Task:

Deploy TestTimelocksLib.

Call testTimelocks with sample data.

Debug until the function returns logical values without reverting.

## 🚨 Go/No-Go Decision (Saturday Night)
This is the most critical checkpoint. Assess the progress honestly.

GO: You have successfully completed Objective 1 and Objective 2. You have isolated test contracts that work and you understand why they were failing previously.

NO-GO: You are still unable to get CREATE2 to work reliably, or the library issues remain unsolved black boxes.

If it is a NO-GO, you must pivot back to the simplified TronDemoEscrow model. This ensures you have a working demo for the final presentation.

## 🎯 Objective 3: The Re-Assembly (Sunday)
前提 (Prerequisite): You have achieved a "GO" decision on Saturday night.

Goal: Integrate the now-proven components back into the full TronEscrowFactory.

### Step 3.1: Create StagedFactory.sol

Copy your original TronEscrowFactory contract.

Comment out all validation logic inside the createDstEscrow function, leaving only the CREATE2 deployment call.

### Step 3.2: Integrate and Test Incrementally

Test 1: Confirm that the stripped-down factory can deploy an escrow.

Test 2: Uncomment and integrate your now-fixed AddressLib logic. Test again.

Test 3: Uncomment and integrate your now-fixed TimelocksLib logic. Test again.

Test 4: Uncomment the final validation require statements one by one, testing after each change.

Test 5: Integrate the safeTransferFrom logic for TRC20 tokens.

Upon completion, you will have a fully functional, 1:1 equivalent of your target architecture, ready for the final demo.
```
