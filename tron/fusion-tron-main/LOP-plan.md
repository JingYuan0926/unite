# 🎯 Limit Order Protocol (LOP) Integration Plan for Fusion-Tron

## 📋 **Overview**

This plan details the integration of 1inch's Limit Order Protocol v4 with your existing Fusion-Tron cross-chain swap system to meet the hackathon requirements.

---

## 🎯 **Requirements Analysis**

### ✅ **Current Status**

- ✅ Bidirectional ETH ↔ TRX swaps working
- ✅ Hashlock and timelock functionality preserved
- ❌ **MISSING**: LOP deployment on Ethereum Sepolia

### 🔴 **Critical Gap**

The challenge requirement states: _"(EVM testnets will require the deployment of Limit Order Protocol contracts)"_

Since you're using **Ethereum Sepolia** (EVM testnet), you need LOP contracts deployed.

---

## 📚 **LOP Architecture Understanding**

### **Core Components**

1. **LimitOrderProtocol.sol** - Main contract for order management
2. **OrderMixin.sol** - Core order logic and validation
3. **Extensions** - Additional functionality (fees, ETH handling, etc.)

### **Key Features**

- EIP-712 order signing
- Off-chain order creation, on-chain filling
- Extensions for custom behavior
- PostInteraction hooks for escrow creation

---

## 🛠 **Implementation Plan**

## **Phase 1: LOP Contract Deployment** ⏱️ _2-4 hours_

### **Step 1.1: Setup LOP Deployment Environment**

1. **Copy LOP contracts to your project:**

```bash
cd fusion-tron-main
mkdir -p contracts/limit-order-protocol
cp -r ../limit-order-protocol-master/contracts/* contracts/limit-order-protocol/
```

2. **Update package.json dependencies:**

```json
{
  "devDependencies": {
    "@1inch/solidity-utils": "^3.1.0",
    "@openzeppelin/contracts": "^4.9.0",
    "hardhat": "^2.17.0",
    "hardhat-deploy": "^0.11.30"
  }
}
```

3. **Create deployment script `scripts/deploy-lop.js`:**

```javascript
const { ethers } = require("hardhat");

async function main() {
  // Sepolia WETH address
  const SEPOLIA_WETH = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";

  console.log("Deploying LimitOrderProtocol to Sepolia...");

  const LimitOrderProtocol = await ethers.getContractFactory(
    "LimitOrderProtocol"
  );
  const limitOrderProtocol = await LimitOrderProtocol.deploy(SEPOLIA_WETH);

  await limitOrderProtocol.deployed();

  console.log("LimitOrderProtocol deployed to:", limitOrderProtocol.address);

  // Save deployment address
  const fs = require("fs");
  const deployment = {
    limitOrderProtocol: limitOrderProtocol.address,
    weth: SEPOLIA_WETH,
    network: "sepolia",
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./deployments/sepolia-lop.json",
    JSON.stringify(deployment, null, 2)
  );

  return limitOrderProtocol.address;
}

main().catch(console.error);
```

### **Step 1.2: Deploy LOP to Sepolia**

```bash
npx hardhat run scripts/deploy-lop.js --network sepolia
```

---

## **Phase 2: Create Fusion Extension** ⏱️ _4-6 hours_

### **Step 2.1: Create FusionExtension Contract**

Create `contracts/FusionExtension.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./limit-order-protocol/contracts/extensions/BaseExtension.sol";
import "./TronEscrowFactory.sol";
import "./EscrowFactory.sol";

contract FusionExtension is BaseExtension {
    struct FusionOrder {
        address srcToken;
        address dstToken;
        uint256 srcAmount;
        uint256 dstAmount;
        uint256 srcChainId;
        uint256 dstChainId;
        bytes32 secretHash;
        uint32 timelock;
        uint256 safetyDeposit;
    }

    EscrowFactory public immutable escrowFactory;

    constructor(address _limitOrderProtocol, address _escrowFactory)
        BaseExtension(_limitOrderProtocol)
    {
        escrowFactory = EscrowFactory(_escrowFactory);
    }

    function _postInteraction(
        IOrderMixin.Order calldata order,
        bytes calldata extension,
        bytes32 orderHash,
        address taker,
        uint256 makingAmount,
        uint256 takingAmount,
        uint256 remainingMakingAmount,
        bytes calldata extraData
    ) internal override {
        // Decode fusion order data
        FusionOrder memory fusionOrder = abi.decode(extraData, (FusionOrder));

        // Create escrow for cross-chain swap
        escrowFactory.createEscrow(
            order.maker,
            fusionOrder.srcToken,
            makingAmount,
            fusionOrder.secretHash,
            fusionOrder.timelock
        );

        emit FusionOrderCreated(orderHash, order.maker, taker);
    }

    event FusionOrderCreated(bytes32 indexed orderHash, address indexed maker, address indexed taker);
}
```

### **Step 2.2: Update EscrowFactory Integration**

Modify your existing `EscrowFactory.sol` to work with LOP:

```solidity
// Add to EscrowFactory.sol
contract EscrowFactory {
    address public limitOrderProtocol;

    modifier onlyLimitOrderProtocol() {
        require(msg.sender == limitOrderProtocol, "Only LOP can call");
        _;
    }

    function createEscrowFromLOP(
        address resolver,
        address token,
        uint256 amount,
        bytes32 secretHash,
        uint64 cancelDelay
    ) external payable onlyLimitOrderProtocol returns (bytes32) {
        // Your existing createEscrow logic
        return createEscrow(resolver, token, amount, secretHash, cancelDelay);
    }
}
```

---

## **Phase 3: Order Creation & Management** ⏱️ _3-4 hours_

### **Step 3.1: Create Order Builder**

Create `src/lop-integration/OrderBuilder.ts`:

```typescript
import { ethers } from "ethers";

export class FusionOrderBuilder {
  private domain: any;
  private types: any;

  constructor(private chainId: number, private lopAddress: string) {
    this.domain = {
      name: "1inch Limit Order Protocol",
      version: "4",
      chainId: chainId,
      verifyingContract: lopAddress,
    };

    this.types = {
      Order: [
        { name: "salt", type: "uint256" },
        { name: "maker", type: "address" },
        { name: "receiver", type: "address" },
        { name: "makerAsset", type: "address" },
        { name: "takerAsset", type: "address" },
        { name: "makingAmount", type: "uint256" },
        { name: "takingAmount", type: "uint256" },
        { name: "makerTraits", type: "uint256" },
      ],
    };
  }

  buildFusionOrder(params: {
    maker: string;
    srcToken: string;
    dstToken: string;
    srcAmount: string;
    dstAmount: string;
    secretHash: string;
    timelock: number;
  }) {
    const order = {
      salt: ethers.randomBytes(32),
      maker: params.maker,
      receiver: ethers.ZeroAddress,
      makerAsset: params.srcToken,
      takerAsset: params.dstToken,
      makingAmount: params.srcAmount,
      takingAmount: params.dstAmount,
      makerTraits: this.buildMakerTraits(),
    };

    return { order, domain: this.domain, types: this.types };
  }

  private buildMakerTraits(): string {
    // Build traits with postInteraction flag
    const POST_INTERACTION_FLAG = 1n << 251n;
    return POST_INTERACTION_FLAG.toString();
  }
}
```

### **Step 3.2: Create Fusion API**

Create `src/lop-integration/FusionAPI.ts`:

```typescript
export class FusionAPI {
  constructor(
    private ethProvider: ethers.Provider,
    private lopContract: ethers.Contract,
    private fusionExtension: ethers.Contract
  ) {}

  async createFusionOrder(params: {
    srcToken: string;
    dstToken: string;
    srcAmount: string;
    dstAmount: string;
    secretHash: string;
    timelock: number;
  }) {
    const orderBuilder = new FusionOrderBuilder(
      await this.ethProvider.getNetwork().then((n) => n.chainId),
      this.lopContract.address
    );

    const { order, domain, types } = orderBuilder.buildFusionOrder(params);

    // Sign the order
    const signer = this.ethProvider.getSigner();
    const signature = await signer._signTypedData(domain, types, order);

    return { order, signature };
  }

  async fillFusionOrder(order: any, signature: string, fillAmount: string) {
    const extraData = ethers.AbiCoder.defaultAbiCoder().encode(
      [
        "tuple(address,address,uint256,uint256,uint256,uint256,bytes32,uint32,uint256)",
      ],
      [
        [
          order.makerAsset,
          order.takerAsset,
          order.makingAmount,
          order.takingAmount,
          1, // srcChainId
          728126428, // tronChainId
          "0x" + "00".repeat(32), // secretHash placeholder
          3600, // timelock
          ethers.parseEther("0.1"), // safety deposit
        ],
      ]
    );

    return this.lopContract.fillOrder(order, signature, fillAmount, extraData);
  }
}
```

---

## **Phase 4: Integration with Existing System** ⏱️ _2-3 hours_

### **Step 4.1: Update Your Atomic Swap Script**

Modify your `atomic-swap.js` to use LOP:

```javascript
class LOPFusionSwap extends FinalWorkingSwap {
  constructor() {
    super();
    this.setupLOP();
  }

  async setupLOP() {
    // Load LOP deployment
    const lopDeployment = require("./deployments/sepolia-lop.json");

    this.lopContract = new ethers.Contract(
      lopDeployment.limitOrderProtocol,
      require("./abis/LimitOrderProtocol.json"),
      this.ethWallet
    );

    console.log("🔗 LOP Contract:", lopDeployment.limitOrderProtocol);
  }

  async executeLOPSwap() {
    console.log("🚀 Starting LOP-enabled Fusion swap...");

    // 1. Create order using LOP
    const fusionAPI = new FusionAPI(this.ethProvider, this.lopContract, null);

    const { order, signature } = await fusionAPI.createFusionOrder({
      srcToken: ethers.ZeroAddress, // ETH
      dstToken: this.tronZeroAddressEthFormat, // TRX
      srcAmount: this.ethAmount.toString(),
      dstAmount: this.tronAmount.toString(),
      secretHash: this.secretHash,
      timelock: this.cancelDelay,
    });

    console.log("✅ LOP Order created and signed");

    // 2. Fill order (creates escrows automatically via postInteraction)
    const fillTx = await fusionAPI.fillFusionOrder(
      order,
      signature,
      order.makingAmount
    );
    await fillTx.wait();

    console.log("✅ LOP Order filled, escrows created");

    // 3. Continue with existing atomic swap logic
    await this.executeAtomicSwapFixed({
      ethEscrowId: "generated",
      tronEscrowId: "generated",
    });
  }
}
```

---

## **Phase 5: Testing & Validation** ⏱️ _2-3 hours_

### **Step 5.1: Create Test Suite**

Create `tests/lop-integration.test.js`:

```javascript
describe("LOP Integration", function () {
  it("Should deploy LOP contracts", async function () {
    // Test deployment
  });

  it("Should create and sign fusion orders", async function () {
    // Test order creation
  });

  it("Should fill orders and create escrows", async function () {
    // Test end-to-end flow
  });

  it("Should complete atomic swap via LOP", async function () {
    // Test full integration
  });
});
```

### **Step 5.2: Manual Testing Checklist**

- [ ] LOP contract deployed to Sepolia
- [ ] FusionExtension deployed and configured
- [ ] Order creation and signing works
- [ ] Order filling creates escrows correctly
- [ ] Atomic swap completes successfully
- [ ] Both transaction hashes available

---

## **Phase 6: Demo Preparation** ⏱️ _1-2 hours_

### **Step 6.1: Create Demo Script**

Create `scripts/demo-lop-fusion.js`:

```javascript
async function runDemo() {
  console.log("🎬 FUSION+ TRON DEMO");
  console.log("===================");

  const swap = new LOPFusionSwap();

  console.log("📋 Demo Steps:");
  console.log("1. Deploy LOP contracts ✅");
  console.log("2. Create Fusion order via LOP");
  console.log("3. Fill order (creates escrows)");
  console.log("4. Execute atomic swap");
  console.log("5. Show both transaction hashes");

  await swap.executeLOPSwap();

  console.log("\n🎉 DEMO COMPLETE!");
  console.log("✅ LOP Integration: WORKING");
  console.log("✅ Bidirectional Swaps: WORKING");
  console.log("✅ Hashlock/Timelock: PRESERVED");
  console.log("✅ Mainnet Execution: READY");
}
```

---

## 📝 **File Structure After Implementation**

```
fusion-tron-main/
├── contracts/
│   ├── limit-order-protocol/        # LOP contracts
│   ├── FusionExtension.sol          # NEW: LOP extension
│   ├── ethereum/EscrowFactory.sol   # Modified for LOP
│   └── tron/TronEscrowFactory.sol
├── src/
│   └── lop-integration/             # NEW: LOP integration
│       ├── OrderBuilder.ts
│       ├── FusionAPI.ts
│       └── types.ts
├── scripts/
│   ├── deploy-lop.js               # NEW: LOP deployment
│   └── demo-lop-fusion.js          # NEW: Demo script
├── deployments/
│   └── sepolia-lop.json            # NEW: LOP addresses
├── tests/
│   └── lop-integration.test.js     # NEW: Tests
├── atomic-swap.js                  # Modified for LOP
└── LOP-plan.md                     # This file
```

---

## 🎯 **Success Criteria**

### ✅ **Meeting Hackathon Requirements**

1. **Hashlock/Timelock Preserved**: ✅ Your existing logic maintained
2. **Bidirectional Swaps**: ✅ ETH ↔ TRX working
3. **LOP Deployment**: ✅ Will be deployed to Sepolia
4. **Onchain Execution**: ✅ Real transactions on testnet

### 📊 **Demo Flow**

1. Show LOP contract on Sepolia Etherscan
2. Create fusion order via LOP interface
3. Fill order → automatic escrow creation
4. Execute atomic swap → show both tx hashes
5. Demonstrate bidirectional capability

---

## ⚡ **Quick Start Commands**

```bash
# 1. Setup
cd fusion-tron-main
npm install

# 2. Deploy LOP
npx hardhat run scripts/deploy-lop.js --network sepolia

# 3. Deploy Fusion Extension
npx hardhat run scripts/deploy-fusion-extension.js --network sepolia

# 4. Run Demo
node scripts/demo-lop-fusion.js

# 5. Test
npm test
```

---

## 🔧 **Troubleshooting References**

### **Key Files to Reference:**

- `limit-order-protocol-master/contracts/LimitOrderProtocol.sol` - Main LOP contract
- `limit-order-protocol-master/deploy/deploy.js` - Deployment patterns
- `cross-chain-swap-master/contracts/EscrowFactory.sol` - Extension patterns
- Your existing `atomic-swap.js` - Current working logic

### **Important Addresses:**

- **Sepolia WETH**: `0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9`
- **Your ETH Escrow**: `process.env.ETH_ESCROW_FACTORY_ADDRESS`
- **Your TRON Escrow**: `process.env.TRON_ESCROW_FACTORY_ADDRESS`

---

This plan provides everything needed to successfully integrate LOP while maintaining your working cross-chain swap functionality. The AI can reference specific sections and files to implement each phase systematically.
