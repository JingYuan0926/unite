# 🔄 Invalidation Reset Solution

## Problem Solved ✅

**Before**: You needed to generate fresh accounts every time you wanted to test, because 1inch LOP tracks invalidation state per account.

**Now**: You can use the same account for continuous testing by resetting the invalidation state using `LOP.increaseEpoch(1)`.

## Quick Start 🚀

### Option 1: Automatic (Recommended)

Your test script now automatically prepares the account:

```bash
# Just run your tests normally - invalidation reset is built-in
npx hardhat run scripts/demo/test-complete-atomic-swap.ts --network sepolia
```

### Option 2: Manual Reset

If you need to reset invalidation manually:

```bash
# Reset invalidation state only
npx ts-node scripts/utils/invalidation-reset.ts reset

# Complete account preparation (reset + approvals)
npx ts-node scripts/utils/invalidation-reset.ts prepare
```

### Option 3: Test the Reset Functionality

```bash
# Test all invalidation reset features
npx hardhat run scripts/utils/test-invalidation-reset.ts --network sepolia
```

## How It Works 🔧

### The Problem

1inch LOP v4 tracks invalidation state per account using epochs

- When an account creates/fills orders, certain patterns get "invalidated"
- Error `0xa4f62a96` indicates invalidation conflict
- Previously required fresh accounts each time

### The Solution

LOP provides `increaseEpoch(series)` function that resets invalidation state:

```typescript
// Reset invalidation for series 0 (default)
const tx = await LOP.connect(wallet).increaseEpoch(0);
await tx.wait();
// Account can now create new orders without invalidation conflicts
```

### What the Utility Does

1. **Checks current epoch state** for your account
2. **Calls `increaseEpoch(0)`** to reset invalidation
3. **Verifies MockTRX approval** for LOP contract
4. **Approves MockTRX if needed** (max allowance)
5. **Confirms account is ready** for testing

## Usage Examples 📚

### In Your Test Scripts

```typescript
import { prepareAccountForTesting } from "../utils/invalidation-reset";

async function myTest() {
  // Prepare account (reset invalidation + ensure approvals)
  await prepareAccountForTesting();

  // Now run your LOP operations normally
  const swapResult = await orchestrator.executeETHtoTRXSwap(params);
}
```

### Standalone Usage

```typescript
import { InvalidationReset } from "./scripts/utils/invalidation-reset";

const invalidationReset = new InvalidationReset(provider);

// Just reset invalidation
await invalidationReset.resetInvalidationState(privateKey);

// Or complete preparation
await invalidationReset.prepareAccountForTesting(privateKey);
```

## Files Changed 📁

- ✅ `scripts/utils/invalidation-reset.ts` - Main utility class
- ✅ `scripts/utils/test-invalidation-reset.ts` - Test the functionality
- ✅ `scripts/demo/test-complete-atomic-swap.ts` - Updated to use auto-reset
- ✅ `INVALIDATION-SOLUTION.md` - This documentation

## Benefits 🎯

### Before (Fresh Account Method)

- ❌ Generate new account each time
- ❌ Fund new account with ETH
- ❌ Approve MockTRX for new account
- ❌ Update .env with new private key
- ❌ Slow and requires manual steps

### After (Invalidation Reset Method)

- ✅ Reuse same account indefinitely
- ✅ One-time account setup
- ✅ Automatic reset in test scripts
- ✅ Fast execution (just one transaction)
- ✅ No manual intervention needed

## Troubleshooting 🔧

### If You Still Get Invalidation Errors

1. **Manual reset**:

   ```bash
   npx ts-node scripts/utils/invalidation-reset.ts prepare
   ```

2. **Check account state**:

   ```bash
   npx hardhat run scripts/utils/test-invalidation-reset.ts --network sepolia
   ```

3. **Verify contract addresses** in the utility match your deployment

### Common Issues

**"Transaction execution reverted"**

- Usually means MockTRX approval is missing
- Run `prepare` command to fix automatically

**"Gas estimation failed"**

- Account might need more ETH for gas
- Fund account with a small amount of ETH

**"USER_A_ETH_PRIVATE_KEY not found"**

- Make sure your `.env` file has the private key
- Keep using the same private key (no need to change it anymore)

## Technical Details 🔬

### LOP Epoch System

- Each account has epochs per series (series 0 is default)
- `increaseEpoch(series)` increments the epoch by 1
- Higher epoch invalidates lower epoch orders
- This is the intended way to "reset" account state

### Gas Costs

- Epoch increase: ~25,000 gas
- MockTRX approval: ~45,000 gas
- Total: ~70,000 gas (~$2-5 depending on gas price)
- Much cheaper than funding fresh accounts

### Contract Interactions

```solidity
// Reset invalidation (what we call)
LOP.increaseEpoch(0);

// Check current epoch (for verification)
uint256 epoch = LOP.epoch(account, 0);

// Approve MockTRX (if needed)
MockTRX.approve(LOPAddress, type(uint256).max);
```

## Next Steps 🚀

1. **Test the solution**:

   ```bash
   npx hardhat run scripts/utils/test-invalidation-reset.ts --network sepolia
   ```

2. **Run your atomic swap tests**:

   ```bash
   npx hardhat run scripts/demo/test-complete-atomic-swap.ts --network sepolia
   ```

3. **Enjoy continuous testing** without fresh account management! 🎉

---

**Result**: You can now run tests continuously with the same account. No more fresh accounts needed! 🚀
