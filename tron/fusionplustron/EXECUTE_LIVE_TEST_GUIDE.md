# 🚀 EXECUTE LIVE TEST GUIDE

## Critical Live Test: TronEscrowFactoryPatched.createDstEscrow()

This guide walks you through executing the **first live, state-changing test** on the deployed TronEscrowFactoryPatched contract to prove its core functionality works on-chain.

## 🎯 Objective

Execute the `createDstEscrow` function on the live factory contract at `TBuzsL2xgcxDf8sc4gYgLAfAKC1J7WhhAH` and verify that it successfully creates and deploys a new escrow proxy contract on the Tron Nile testnet.

## 📋 Prerequisites

### 1. Environment Setup

```bash
# Navigate to the project directory
cd fusionplustron

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### 2. Required Environment Variables

```bash
# Tron Configuration
TRON_API_KEY=your-tron-api-key-here
TRON_PRIVATE_KEY=your-private-key-here
TRON_RPC_URL=https://nile.trongrid.io
TRON_NETWORK=nile
```

### 3. Get Test TRX

1. Visit: https://nileex.io/join/getJoinPage
2. Get 1000+ test TRX for deployment costs
3. Get Tron API key from: https://www.trongrid.io/

### 4. Install Dependencies

```bash
npm install
```

## 🧪 Execute the Live Test

### Run the Test Script

```bash
node scripts/test/test-factory-create-escrow.js
```

### Expected Test Flow

#### Step 1: Factory Verification

```
🔍 Step 1: Verifying Factory Contract
   Is Tron Factory: true
   Tron Chain ID: 3448148188
✅ Factory verification successful
```

#### Step 2: Parameter Construction

```
🔍 Step 2: Constructing Immutables Struct
   Constructed Parameters:
     Order Hash: 0x[generated-hash]
     Hashlock: 0x[keccak256-of-secret]
     Secret (for verification): test-secret-[timestamp]
     Maker: [your-tron-address]
     Taker: [your-tron-address]
     Token: Native TRX (0x0000000000000000000000000000000000000000)
     Amount: 1 TRX
     Safety Deposit: 0.1 TRX
     Total Value Required: 1.1 TRX
```

#### Step 3: Transaction Execution

```
🔍 Step 3: Executing createDstEscrow Transaction
   Sending 1.1 TRX with transaction...
✅ Transaction Submitted: [real-tx-hash]
🔗 Tronscan: https://nile.tronscan.org/#/transaction/[real-tx-hash]
```

#### Step 4: Event Log Parsing

```
🔍 Step 4: Retrieving Transaction Details and Event Logs
   Gas Used: [energy-amount] energy
   Transaction Status: SUCCESS
   Found 1 event log(s)
✅ Found DstEscrowCreated event!
   📍 New Escrow Address: [new-escrow-address]
   🔐 Event Hashlock: [hashlock]
   👤 Event Taker: [taker-address]
```

#### Step 5: Contract Verification

```
🔍 Step 5: Verifying Deployed Escrow Contract
✅ Escrow contract found on-chain!
   Contract Address: [new-escrow-address]
   Bytecode Length: [length] characters
🔗 Contract Explorer: https://nile.tronscan.org/#/contract/[new-escrow-address]
✅ Escrow account exists on Tron blockchain
   Account Type: Contract
   Balance: 1.1 TRX
```

## 🎊 Success Indicators

### ✅ Complete Success Output

```
🎊 ✅ LIVE TEST SUCCESSFUL! ✅ 🎊

🔥 CRITICAL SUCCESS METRICS:
   ✅ createDstEscrow() executed successfully
   ✅ DstEscrowCreated event emitted
   ✅ New escrow proxy deployed on-chain
   ✅ CREATE2 deployment working on Tron TVM

📋 TRANSACTION DETAILS:
   🔗 TX Hash: [real-transaction-hash]
   📍 Escrow Address: [new-escrow-contract-address]
   ⛽ Gas Used: [energy-consumed] energy
   💰 Total Value: 1.1 TRX

🔗 VERIFICATION LINKS:
   Transaction: https://nile.tronscan.org/#/transaction/[tx-hash]
   New Contract: https://nile.tronscan.org/#/contract/[escrow-address]

🚀 SYSTEM STATUS: READY FOR FULL INTEGRATION!
✅ The TronEscrowFactoryPatched is LIVE and FUNCTIONAL
✅ Cross-chain atomic swaps can now be executed
✅ Off-chain systems can be updated with confidence
```

## 📄 Test Results

The test will generate a detailed report: `FACTORY_CREATE_ESCROW_TEST_REPORT.json`

### Report Contents

```json
{
  "testType": "LIVE_FACTORY_CREATE_ESCROW_TEST",
  "factoryAddress": "TBuzsL2xgcxDf8sc4gYgLAfAKC1J7WhhAH",
  "network": "Tron Nile Testnet",
  "timestamp": "[iso-timestamp]",
  "results": [
    {
      "testName": "createDstEscrow",
      "txHash": "[real-transaction-hash]",
      "escrowAddress": "[new-escrow-address]",
      "gasUsed": "[energy-amount]",
      "success": true,
      "tronscanUrl": "https://nile.tronscan.org/#/transaction/[tx-hash]",
      "contractExplorerUrl": "https://nile.tronscan.org/#/contract/[escrow-address]"
    }
  ],
  "summary": {
    "success": true,
    "escrowCreated": true,
    "readyForIntegration": true
  }
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Insufficient TRX Balance

```
Error: Insufficient native value
Solution: Get more test TRX from https://nileex.io/join/getJoinPage
```

#### 2. Private Key Issues

```
Error: Invalid private key
Solution: Check your .env file and ensure TRON_PRIVATE_KEY is correct
```

#### 3. Network Connection

```
Error: Network request failed
Solution: Check TRON_API_KEY and internet connection
```

#### 4. Factory Address Not Found

```
Error: Contract not found
Solution: Verify factory address TBuzsL2xgcxDf8sc4gYgLAfAKC1J7WhhAH is correct
```

## 💰 Cost Estimation

### Test Costs (Tron Nile Testnet)

- **Escrow Amount**: 1 TRX
- **Safety Deposit**: 0.1 TRX
- **Gas Fees**: ~0.01 TRX
- **Total Cost**: ~1.11 TRX

### Production Costs (Tron Mainnet)

- **Escrow Amount**: Variable (user-defined)
- **Safety Deposit**: Variable (user-defined)
- **Gas Fees**: ~$0.50 USD equivalent
- **Total**: Depends on swap amount

## 🎯 Success Criteria

The test is considered successful when:

1. ✅ **Transaction Confirms**: createDstEscrow transaction shows SUCCESS on Tronscan
2. ✅ **Event Emitted**: DstEscrowCreated event is found in transaction logs
3. ✅ **Contract Deployed**: New escrow address has bytecode and balance
4. ✅ **Address Matches**: Event escrow address matches computed CREATE2 address
5. ✅ **Funds Locked**: Escrow contract holds the correct TRX amount

## 🚀 After Success

Once the test passes:

1. **Document Results**: Save the transaction hash and escrow address
2. **Update Integration**: TronExtension.ts is already updated with factory address
3. **Begin Full Testing**: Start end-to-end cross-chain swap development
4. **Production Planning**: Prepare for Tron mainnet deployment

---

**🎊 Execute this test to prove the TronEscrowFactoryPatched is ready for production use!**

_Factory Address: TBuzsL2xgcxDf8sc4gYgLAfAKC1J7WhhAH_
_Network: Tron Nile Testnet_
_Estimated Time: 2-3 minutes_
_Cost: ~1.11 TRX_
