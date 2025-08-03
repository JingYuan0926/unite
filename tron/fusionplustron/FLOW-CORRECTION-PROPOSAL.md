# 🔧 ATOMIC SWAP FLOW CORRECTION

## 🚨 **CURRENT PROBLEM IDENTIFIED**

The current implementation has User B (resolver) paying ETH for User A's (maker) swap. This is backwards and incorrect.

### **Current (Wrong) Flow:**

```
1. User A signs LOP order
2. User B calls DemoResolver.executeAtomicSwap()
3. User B sends 0.011 ETH (amount + safety deposit)
4. User A receives TRX but paid nothing!
```

### **User A's Etherscan Evidence:**

- No ETH outgoing transactions for the swap amount
- Only small gas fees for `increaseEpoch` and `withdraw`
- Balance never decreased by the swap amount

---

## ✅ **CORRECT ATOMIC SWAP FLOW**

### **Corrected Flow:**

```
1. User A calls DemoResolver.executeAtomicSwap()
2. User A sends 0.011 ETH (amount + safety deposit)
3. User A signs LOP order authorizing the execution
4. User B facilitates Tron-side escrow creation
5. User A receives TRX for the ETH they paid
```

---

## 🔧 **IMPLEMENTATION OPTIONS**

### **Option 1: Two-Step Flow (Recommended)**

```typescript
// Step 1: User A locks ETH in escrow
await userA_signer.DemoResolver.executeAtomicSwap({
  value: ethAmount + safetyDeposit,
});

// Step 2: User B facilitates Tron escrow (no ETH payment)
await userB_facilitateTronEscrow();
```

### **Option 2: User A Direct Payment**

```typescript
// User A pays directly, User B just signs/facilitates
const userASigner = new ethers.Wallet(userAPrivateKey, provider);
await userASigner.DemoResolver.executeAtomicSwap({
  value: ethAmount + safetyDeposit,
});
```

---

## 💡 **RECOMMENDED SOLUTION**

**Modify `CrossChainOrchestrator.ts`:**

1. **Change caller from User B to User A** for ETH payments
2. **User A signs AND pays** for their own swap
3. **User B only facilitates** Tron-side operations

### **Code Changes Needed:**

```typescript
// OLD (incorrect):
const resolverWithSigner = this.resolverContract.connect(this.userB_ethSigner);

// NEW (correct):
const resolverWithSigner = this.resolverContract.connect(this.userA_ethSigner);
```

---

## 🎯 **WHY THIS MATTERS**

1. **Economic Logic**: User A wants TRX, so User A should pay ETH
2. **Security**: User A controls their own funds
3. **Decentralization**: No need for User B to have ETH balance
4. **User Experience**: Clear who pays what

---

## 🚀 **NEXT STEPS**

1. Fix the caller in `CrossChainOrchestrator.ts`
2. Test that User A actually pays ETH
3. Verify User A's balance decreases correctly
4. Confirm Etherscan shows proper ETH outgoing transaction

This will make the atomic swap flow economically correct and match user expectations.
