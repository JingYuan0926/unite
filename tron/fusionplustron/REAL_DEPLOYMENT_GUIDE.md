# REAL Tron Deployment Guide - Step by Step

## ⚠️ IMPORTANT: This is for ACTUAL on-chain deployment with REAL transaction hashes

## Prerequisites

### 1. Environment Setup

```bash
# Install dependencies
npm install tronweb@latest hardhat dotenv

# Create .env file
cp .env.example .env
```

### 2. Configure Environment Variables

```bash
# .env file
TRON_PRIVATE_KEY="your-actual-tron-private-key-here"
TRON_API_KEY="your-tron-api-key-here"  # Get from trongrid.io
TRON_NETWORK="nile"  # or "mainnet"
```

### 3. Get Test TRX

- Visit: https://nileex.io/join/getJoinPage
- Get test TRX for Nile testnet
- Minimum 1000 TRX recommended for deployment

## Real Deployment Steps

### Phase 1: Deploy TronCreate2Test

```bash
npx hardhat run scripts/deploy/phase1-deploy-create2-test.ts --network tron
```

**Expected Output:**

```
✅ TronCreate2Test deployed to: TR7.... (REAL ADDRESS)
📋 Transaction Hash: abc123... (REAL TX HASH)
🔗 Tronscan: https://nile.tronscan.org/#/transaction/abc123...
```

### Phase 2: Test CREATE2 Functionality

```bash
npx hardhat run scripts/test/test-create2.ts --network tron
```

**Expected Output:**

```
✅ testComputeAddress() - TX: def456...
✅ testDeployment() - TX: ghi789...
✅ compareCreate2Methods() - TX: jkl012...
```

### Phase 3: Deploy TronClonesTest

```bash
npx hardhat run scripts/deploy/phase2-deploy-clones-test.ts --network tron
```

### Phase 4: Deploy AddressLibTest

```bash
npx hardhat run scripts/deploy/phase3-deploy-addresslib-test.ts --network tron
```

### Phase 5: Deploy TronEscrowFactoryPatched

```bash
npx hardhat run scripts/deploy/phase4-deploy-factory.ts --network tron
```

### Phase 6: Execute Full Integration Test

```bash
npx hardhat run scripts/test/full-integration-test.ts --network tron
```

## Verification Checklist

### ✅ Contract Deployment Verification

- [ ] All contracts deployed without revert
- [ ] Contract addresses are valid Tron addresses (start with T)
- [ ] Transaction hashes are 64-character hex strings
- [ ] All transactions show "SUCCESS" status on Tronscan

### ✅ Function Testing Verification

- [ ] `TronCreate2Test.testComputeAddress()` returns valid address
- [ ] `TronCreate2Test.testDeployment()` deploys contract successfully
- [ ] `TronClonesTest.testCloneDeterministic()` creates proxy
- [ ] `AddressLibTest.testAddressGet()` converts addresses correctly
- [ ] `TronEscrowFactoryPatched.createDstEscrow()` completes without revert

### ✅ TVM Compatibility Verification

- [ ] CREATE2 uses 0x41 prefix (not 0xff)
- [ ] Proxy bytecode hash computed correctly
- [ ] AddressLib conversions work with Tron addresses
- [ ] No assembly-related reverts
- [ ] Gas usage within reasonable limits

## Real Transaction Examples

After successful deployment, you should see:

```
📋 REAL DEPLOYMENT RESULTS:

Phase 1 - TronCreate2Test:
Address: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
TX: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
Tronscan: https://nile.tronscan.org/#/transaction/a1b2c3...

Phase 2 - TronClonesTest:
Address: TG3XXyExBkPp9nzdajDZsozEu4BkaSJozs
TX: b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3
Tronscan: https://nile.tronscan.org/#/transaction/b2c3d4...

Phase 3 - AddressLibTest:
Address: TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax
TX: c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4
Tronscan: https://nile.tronscan.org/#/transaction/c3d4e5...

Phase 4 - TronEscrowFactoryPatched:
Address: TLsV52sRDL79HXGGm9yzwKiVegTp5CVZiS
TX: d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5
Tronscan: https://nile.tronscan.org/#/transaction/d4e5f6...
```

## Common Issues & Solutions

### Issue: "REVERT" with no message

**Solution**: Check CREATE2 prefix in TronCreate2Lib

```solidity
// Ensure this is 0x41, not 0xff
bytes1 private constant _TRON_CREATE2_PREFIX = 0x41;
```

### Issue: "Insufficient bandwidth or energy"

**Solution**: Increase fee limit or get more TRX

```javascript
feeLimit: 1000000000, // 1000 TRX
```

### Issue: Address mismatch in proxy deployment

**Solution**: Verify TronProxyHashLib bytecode computation

### Issue: AddressLib conversion errors

**Solution**: Use proper Tron address format (base58)

## Success Criteria

The deployment is **SUCCESSFUL** if:

1. ✅ All 4 contracts deploy without reverting
2. ✅ All test functions execute successfully
3. ✅ Real transaction hashes on Tron Nile testnet
4. ✅ Contracts visible on Tronscan
5. ✅ `createDstEscrow()` function works with test parameters
6. ✅ No CREATE2 prefix errors
7. ✅ Gas usage < 100M energy per transaction

## Final Verification Command

```bash
# Run complete verification suite
npx hardhat run scripts/verify/complete-verification.ts --network tron
```

This will:

- Deploy all contracts
- Execute all tests
- Generate real transaction report
- Verify TVM compatibility
- Confirm no reverts occur

## Support

If you encounter any reverts or issues during **real deployment**:

1. Share the **actual transaction hash** that failed
2. Provide the **Tronscan link** showing the error
3. Include the **exact error message** from Tron
4. Share your **deployment configuration**

This will allow for precise debugging of real on-chain issues.
