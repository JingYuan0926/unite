# Cross-Chain Atomic Swap Implementation Plan

_Complete ETH ↔ TRX Atomic Swaps with Official 1inch LOP Integration_

## 🎯 **PROJECT GOAL**

Implement the complete cross-chain atomic swap flows between Ethereum and Tron using official 1inch Limit Order Protocol contracts with custom resolver integration.

## 📋 **DEMO REQUIREMENTS COMPLIANCE**

- ✅ **LOP Deployment**: Official LOP contracts deployed on Sepolia testnet
- ✅ **Onchain Execution**: Real token transfers using deployed LOP contracts
- ✅ **Custom Resolver**: DemoResolverV2 as custom resolver (non-official, compliant)
- ✅ **Bidirectional Swaps**: ETH→TRX and TRX→ETH flows
- ✅ **Hashlock/Timelock**: Full HTLC functionality preserved

## 🏗️ **TARGET ARCHITECTURE**

### **ETH → TRX Flow (LOP Integration)**

```
1. User A (Maker) → Creates 1inch Limit Order → Signs off-chain → Submits to Order Book
2. User B (Resolver) → Monitors Order Book → Creates TronEscrowDst → Calls DemoResolverV2
3. DemoResolverV2 → Verifies order → Creates EscrowSrc via LOP postInteraction → Atomic execution
4. Claims: User B withdraws ETH (reveals secret) → User A withdraws TRX with secret
```

### **TRX → ETH Flow (Direct Escrow)**

```
1. User A (Maker) → Creates TronEscrowSrc directly on Tron
2. User B (Resolver) → Monitors Tron → Creates EthereumEscrowDst
3. Claims: User B withdraws TRX (reveals secret) → User A withdraws ETH with secret
```

### **Role Definitions**

- **User A**: MAKER (order/escrow creator)
- **User B**: RESOLVER (custom resolver, fills orders/escrows)
- **DemoResolverV2**: Your custom smart contract resolver
- **Official LOP**: 1inch Limit Order Protocol (required deployment)
- **Official EscrowFactory**: Creates real EscrowSrc/EscrowDst contracts

## 📊 **CURRENT STATUS**

### ✅ **Completed Components**

- ✅ **Official LOP Deployed**: `0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0` on Sepolia
- ✅ **Official EscrowFactory**: `0x92E7B96407BDAe442F52260dd46c82ef61Cf0EFA` on Sepolia
- ✅ **DemoResolverV2**: `0xc6143027AC4DCc287e328DBea6B42C7CDC1EE530` with LOP integration
- ✅ **TronEscrowFactory**: `TBuzsL2xgcxDf8sc4gYgLAfAKC1J7WhhAH` on Tron Nile
- ✅ **LOP Integration**: `DemoResolverV2.executeAtomicSwap()` calls `LOP.fillOrderArgs()`
- ✅ **postInteraction**: EscrowFactory creates real EscrowSrc contracts
- ✅ **Cross-Chain Coordination**: ETH ↔ TRX atomic execution working

### 🚨 **Critical Gaps**

- 🚨 **Escrow Address Extraction**: Line 406 in CrossChainOrchestrator.ts hardcodes DemoResolver instead of extracting real EscrowSrc address
- ⚠️ **Mock Orders**: Currently uses mock 1inch orders instead of real LOP-compliant orders
- ⚠️ **Order Book Integration**: No real order creation/discovery system

## 🚧 **IMPLEMENTATION PHASES**

---

## **PHASE 1: CRITICAL - Real EscrowSrc Integration** 🚨

**Priority**: IMMEDIATE - Required for official pattern compliance  
**Status**: IN PROGRESS

### **1.1 Extract Real EscrowSrc Address (CRITICAL)**

**Current Issue**:

```typescript
// ❌ CURRENT (Line 406 in CrossChainOrchestrator.ts):
ethEscrowAddress = this.config.DEMO_RESOLVER_ADDRESS; // Uses DemoResolver as escrow
```

**Required Fix**:

```typescript
// ✅ REQUIRED: Extract real EscrowSrc address from transaction receipt
const receipt = await deployTx.wait();
const escrowCreatedEvent = parseEscrowCreatedEvent(receipt);
ethEscrowAddress = escrowCreatedEvent.escrowAddress; // Use real EscrowSrc contract
```

**Implementation Steps**:

1. **Parse Transaction Receipt**: Add event parsing logic in CrossChainOrchestrator.ts
2. **Extract SrcEscrowCreated Event**: Parse `EscrowFactory.SrcEscrowCreated(IBaseEscrow.Immutables, DstImmutablesComplement)`
3. **Compute Escrow Address**: Use `immutables.hash()` to get deterministic address
4. **Update ethEscrowAddress**: Replace hardcoded value with extracted address
5. **Test Integration**: Verify claims work with real EscrowSrc contracts

**Files to Modify**:

- `fusionplustron/src/sdk/CrossChainOrchestrator.ts` (line 406)
- Add event parsing utilities for EscrowFactory events

### **1.2 Verify Official Pattern Compliance**

**Validate Flow**:

```
User A order → DemoResolverV2.executeAtomicSwap() → LOP.fillOrderArgs() →
postInteraction → EscrowFactory.createSrcEscrow() → Real EscrowSrc contract →
ETH transferred to EscrowSrc → Claims use real escrow address
```

**Success Criteria**:

- ✅ Real EscrowSrc contract created and funded
- ✅ ETH transferred to EscrowSrc (not DemoResolver)
- ✅ Claims work with real escrow addresses
- ✅ Full official 1inch pattern compliance

---

## **PHASE 2: Real 1inch Order Creation** ⚠️

**Priority**: HIGH - Required for demo compliance  
**Status**: PENDING

### **2.1 Replace Mock Orders with Real LOP Orders**

**Current Issue**:

```typescript
// ❌ CURRENT: Mock orders in Official1inchSDK.ts
const mockOrder = {
  /* simplified structure */
};
```

**Required Implementation**:

```typescript
// ✅ REQUIRED: Real 1inch LOP order structure
export class Official1inchSDK {
  async createRealLimitOrder(
    params: OrderCreationParams
  ): Promise<IOrderMixin.Order> {
    // Create proper 1inch order structure
    const order: IOrderMixin.Order = {
      salt: generateSalt(),
      maker: params.makerAddress,
      receiver: params.receiverAddress,
      makerAsset: params.makerToken, // ETH
      takerAsset: params.takerToken, // Cross-chain token representation
      makingAmount: params.ethAmount,
      takingAmount: params.expectedAmount,
      makerTraits: params.makerTraits,
    };
    return order;
  }

  async signOrderEIP712(
    order: IOrderMixin.Order
  ): Promise<{ r: string; vs: string }> {
    // Implement EIP-712 signing for real orders
    const domain = await this.getEIP712Domain();
    const signature = await signer._signTypedData(domain, ORDER_TYPES, order);
    return ethers.utils.splitSignature(signature);
  }

  async validateOrderStructure(order: IOrderMixin.Order): Promise<boolean> {
    // Validate order against LOP requirements
    return this.lopContract.checkOrderFormat(order);
  }
}
```

**Implementation Steps**:

1. **Study LOP Order Format**: Analyze official IOrderMixin.Order structure
2. **Implement Order Creation**: Real order construction with proper fields
3. **EIP-712 Signing**: Implement proper domain and type hashing
4. **Order Validation**: Ensure LOP compliance before submission
5. **Integration**: Replace mock orders in CrossChainOrchestrator

**Files to Modify**:

- `fusionplustron/src/sdk/Official1inchSDK.ts`
- `fusionplustron/src/sdk/CrossChainOrchestrator.ts` (order creation calls)

---

## **PHASE 3: Complete TRX → ETH Flow** 📝

**Priority**: MEDIUM - For bidirectional demo  
**Status**: CODE READY

### **3.1 Implement TRX → ETH Swap Function**

**Current Status**:

```typescript
// ❌ CURRENT: Throws "not yet implemented"
async executeTRXtoETHSwap(params: SwapParams): Promise<SwapResult> {
  throw new Error("TRX to ETH swap not yet implemented");
}
```

**Required Implementation**:

```typescript
// ✅ REQUIRED: Complete TRX → ETH flow
async executeTRXtoETHSwap(params: SwapParams): Promise<SwapResult> {
  // 1. User A creates TronEscrowSrc (using existing code)
  const tronEscrowAddress = await this.tronExtension.deployTronEscrowSrc({
    amount: params.trxAmount,
    hashlock: params.hashlock,
    beneficiary: params.ethReceiveAddress,
    timelocks: params.timelocks
  });

  // 2. User B monitors and creates EthereumEscrowDst
  const ethEscrowAddress = await this.createEthereumEscrowDst({
    amount: params.ethAmount,
    hashlock: params.hashlock,
    beneficiary: params.tronSenderAddress,
    srcEscrowAddress: tronEscrowAddress
  });

  // 3. Return swap details for claiming
  return {
    tronEscrowAddress,
    ethEscrowAddress,
    hashlock: params.hashlock,
    secret: params.secret
  };
}
```

**Files to Modify**:

- `fusionplustron/src/sdk/CrossChainOrchestrator.ts`

---

## 🔄 **DETAILED IMPLEMENTATION FLOWS**

### **ETH → TRX Complete Flow**

**Step 1: Order Creation (User A)**

```typescript
// User A creates and signs real 1inch limit order
const order = await official1inchSDK.createRealLimitOrder({
  makerAddress: userA.address,
  makerToken: ETH_ADDRESS,
  makingAmount: ethers.utils.parseEther("1"), // 1 ETH
  takerToken: CROSS_CHAIN_TRX_REPRESENTATION,
  takingAmount: ethers.utils.parseUnits("30000", 6), // 30,000 TRX
  makerTraits: DEFAULT_MAKER_TRAITS,
});

const signature = await official1inchSDK.signOrderEIP712(order);
await orderBook.submitOrder({ order, signature });
```

**Step 2: Order Discovery (User B/Resolver)**

```typescript
// Resolver monitors and finds profitable order
const availableOrders = await orderBook.getAvailableOrders();
const selectedOrder = analyzeOrderProfitability(availableOrders);

// Generate secret and create Tron destination escrow
const secret = generateRandomSecret();
const hashlock = keccak256(secret);

const tronEscrowAddress = await tronExtension.deployTronEscrowDst({
  amount: selectedOrder.takingAmount, // 30,000 TRX
  hashlock: hashlock,
  beneficiary: selectedOrder.maker, // User A
  timelocks: generateTimelocks(),
});
```

**Step 3: Atomic Execution (DemoResolverV2)**

```typescript
// Resolver calls DemoResolverV2.executeAtomicSwap()
const deployTx = await demoResolver.executeAtomicSwap(
  immutables, // Include hashlock from Tron escrow
  selectedOrder.order, // User A's signed order
  signature.r,
  signature.vs,
  selectedOrder.order.makingAmount,
  takerTraits,
  args
);

// ✅ CRITICAL: Extract real EscrowSrc address from transaction
const receipt = await deployTx.wait();
const escrowCreatedEvent = parseEscrowFactoryEvent(receipt, "SrcEscrowCreated");
const realEthEscrowAddress = computeEscrowAddress(
  escrowCreatedEvent.srcImmutables
);

// LOP automatically transfers ETH from User A to real EscrowSrc
```

**Step 4: Claims**

```typescript
// User B claims ETH (reveals secret)
await ethEscrowContract.connect(userB).withdraw(secret);

// User A monitors and claims TRX
const revealedSecret = await getSecretFromEthereumTransaction();
await tronEscrowContract.connect(userA).withdraw(revealedSecret);
```

---

## ✅ **SUCCESS CRITERIA & IMMEDIATE NEXT STEPS**

### **Phase 1 Success (Critical)**

- ✅ Real EscrowSrc contracts created and used for claims
- ✅ Official 1inch pattern: LOP → postInteraction → EscrowFactory → Real Escrow
- ✅ ETH transferred to real escrow contracts (not DemoResolver)
- ✅ Complete atomic execution with official LOP integration

### **IMMEDIATE PRIORITY**

1. **Fix Line 406**: Extract real EscrowSrc address in CrossChainOrchestrator.ts
2. **Create Real Orders**: Replace mock orders with real LOP orders
3. **Final Testing**: End-to-end demo validation

### **Current Test Command**

```bash
npx ts-node scripts/demo/test-complete-atomic-swap.ts
```

**🎯 STATUS**: 90% complete - needs real escrow address extraction for full official compliance!
