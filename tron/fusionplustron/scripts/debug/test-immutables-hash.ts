import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

/**
 * Test the immutables.hash() function in isolation
 * This helps identify if the issue is with the hash computation itself
 */

async function main() {
  console.log("🔍 IMMUTABLES HASH FUNCTION TESTING");
  console.log("===================================\n");

  const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL!);
  const wallet = new ethers.Wallet(process.env.ETH_PRIVATE_KEY!, provider);

  // Test immutables hash computation locally
  console.log("1️⃣ LOCAL HASH COMPUTATION");
  console.log("=========================");

  const testImmutables = {
    orderHash: ethers.keccak256(ethers.toUtf8Bytes("test-order")),
    hashlock: ethers.keccak256(ethers.toUtf8Bytes("test-secret")),
    maker: wallet.address,
    taker: "0x742d35Cc6634C0532925a3b8D0Ca3c7a1df09bb7",
    token: ethers.ZeroAddress, // ETH
    amount: ethers.parseEther("1"),
    safetyDeposit: ethers.parseEther("0.1"),
    timelocks: {
      deployedAt: 1700000000,
      srcWithdrawal: 1700000600,
      srcCancellation: 1700003600,
      dstWithdrawal: 1700000300,
      dstCancellation: 1700003300,
    },
  };

  console.log("Test immutables:");
  console.log(JSON.stringify(testImmutables, null, 2));

  // Compute hash manually using ethers ABI encoding
  try {
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
      [
        "tuple(bytes32,bytes32,address,address,address,uint256,uint256,tuple(uint64,uint64,uint64,uint64,uint64))",
      ],
      [
        [
          testImmutables.orderHash,
          testImmutables.hashlock,
          testImmutables.maker,
          testImmutables.taker,
          testImmutables.token,
          testImmutables.amount,
          testImmutables.safetyDeposit,
          [
            testImmutables.timelocks.deployedAt,
            testImmutables.timelocks.srcWithdrawal,
            testImmutables.timelocks.srcCancellation,
            testImmutables.timelocks.dstWithdrawal,
            testImmutables.timelocks.dstCancellation,
          ],
        ],
      ]
    );

    const hash = ethers.keccak256(encoded);
    console.log(`✅ Local hash computation successful: ${hash}`);
    console.log(`✅ Encoded data length: ${encoded.length}`);
    console.log(`✅ Encoded data: ${encoded.substring(0, 100)}...`);
  } catch (error) {
    console.log(`❌ Local hash computation failed: ${error.message}`);
  }

  // Test with a deployed test contract that can compute hashes
  console.log("\n2️⃣ ON-CHAIN HASH COMPUTATION TEST");
  console.log("=================================");

  // Deploy a simple test contract to compute immutables hash
  const testContractSource = `
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;
    
    contract ImmutablesHashTester {
        struct Timelocks {
            uint64 deployedAt;
            uint64 srcWithdrawal;
            uint64 srcCancellation;
            uint64 dstWithdrawal;
            uint64 dstCancellation;
        }
        
        struct Immutables {
            bytes32 orderHash;
            bytes32 hashlock;
            address maker;
            address taker;
            address token;
            uint256 amount;
            uint256 safetyDeposit;
            Timelocks timelocks;
        }
        
        function computeHash(Immutables calldata immutables) external pure returns (bytes32) {
            return keccak256(abi.encode(immutables));
        }
        
        function computeHashPacked(Immutables calldata immutables) external pure returns (bytes32) {
            return keccak256(abi.encodePacked(
                immutables.orderHash,
                immutables.hashlock,
                immutables.maker,
                immutables.taker,
                immutables.token,
                immutables.amount,
                immutables.safetyDeposit,
                immutables.timelocks.deployedAt,
                immutables.timelocks.srcWithdrawal,
                immutables.timelocks.srcCancellation,
                immutables.timelocks.dstWithdrawal,
                immutables.timelocks.dstCancellation
            ));
        }
    }
  `;

  try {
    console.log("Deploying hash tester contract...");

    // This would require compilation - for now, let's test with existing contracts
    console.log("⚠️  Skipping on-chain test (requires contract compilation)");
  } catch (error) {
    console.log(`❌ On-chain test failed: ${error.message}`);
  }

  // Test CREATE2 address computation
  console.log("\n3️⃣ CREATE2 ADDRESS COMPUTATION");
  console.log("==============================");

  try {
    // Mock the CREATE2 computation that the EscrowFactory would do
    const factoryAddress = "0x92E7B96407BDAe442F52260dd46c82ef61Cf0EFA";
    const implementationAddress = "0x04C7BDA8049Ae6d87cc2E793ff3cc342C47784f0"; // Mock

    // Compute what the CREATE2 address should be
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
      [
        "tuple(bytes32,bytes32,address,address,address,uint256,uint256,tuple(uint64,uint64,uint64,uint64,uint64))",
      ],
      [
        [
          testImmutables.orderHash,
          testImmutables.hashlock,
          testImmutables.maker,
          testImmutables.taker,
          testImmutables.token,
          testImmutables.amount,
          testImmutables.safetyDeposit,
          [
            testImmutables.timelocks.deployedAt,
            testImmutables.timelocks.srcWithdrawal,
            testImmutables.timelocks.srcCancellation,
            testImmutables.timelocks.dstWithdrawal,
            testImmutables.timelocks.dstCancellation,
          ],
        ],
      ]
    );

    const salt = ethers.keccak256(encoded);

    // Mock bytecode hash (this would be the actual proxy bytecode hash)
    const mockBytecodeHash = ethers.keccak256(
      ethers.toUtf8Bytes("mock-proxy-bytecode")
    );

    const create2Address = ethers.getCreate2Address(
      factoryAddress,
      salt,
      mockBytecodeHash
    );

    console.log(`✅ Computed CREATE2 address: ${create2Address}`);
    console.log(`✅ Salt (immutables hash): ${salt}`);
    console.log(`✅ Factory: ${factoryAddress}`);
    console.log(`✅ Mock bytecode hash: ${mockBytecodeHash}`);
  } catch (error) {
    console.log(`❌ CREATE2 computation failed: ${error.message}`);
  }

  // Test different immutables variations
  console.log("\n4️⃣ IMMUTABLES VARIATIONS TEST");
  console.log("=============================");

  const variations = [
    {
      name: "All zeros",
      immutables: {
        orderHash: ethers.ZeroHash,
        hashlock: ethers.ZeroHash,
        maker: ethers.ZeroAddress,
        taker: ethers.ZeroAddress,
        token: ethers.ZeroAddress,
        amount: 0,
        safetyDeposit: 0,
        timelocks: {
          deployedAt: 0,
          srcWithdrawal: 0,
          srcCancellation: 0,
          dstWithdrawal: 0,
          dstCancellation: 0,
        },
      },
    },
    {
      name: "Minimal valid",
      immutables: {
        orderHash: ethers.keccak256(ethers.toUtf8Bytes("1")),
        hashlock: ethers.keccak256(ethers.toUtf8Bytes("2")),
        maker: "0x0000000000000000000000000000000000000001",
        taker: "0x0000000000000000000000000000000000000002",
        token: ethers.ZeroAddress,
        amount: 1,
        safetyDeposit: 1,
        timelocks: {
          deployedAt: 1,
          srcWithdrawal: 2,
          srcCancellation: 3,
          dstWithdrawal: 4,
          dstCancellation: 5,
        },
      },
    },
    {
      name: "Large values",
      immutables: {
        orderHash: ethers.keccak256(ethers.randomBytes(32)),
        hashlock: ethers.keccak256(ethers.randomBytes(32)),
        maker: wallet.address,
        taker: "0x742d35Cc6634C0532925a3b8D0Ca3c7a1df09bb7",
        token: "0xA0b86a33E6441D8e55c95c4C1F0c2a46e5C8A6F7",
        amount: ethers.parseEther("1000"),
        safetyDeposit: ethers.parseEther("100"),
        timelocks: {
          deployedAt: Math.floor(Date.now() / 1000),
          srcWithdrawal: Math.floor(Date.now() / 1000) + 86400,
          srcCancellation: Math.floor(Date.now() / 1000) + 172800,
          dstWithdrawal: Math.floor(Date.now() / 1000) + 43200,
          dstCancellation: Math.floor(Date.now() / 1000) + 129600,
        },
      },
    },
  ];

  for (const variation of variations) {
    console.log(`\nTesting variation: ${variation.name}`);
    try {
      const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
        [
          "tuple(bytes32,bytes32,address,address,address,uint256,uint256,tuple(uint64,uint64,uint64,uint64,uint64))",
        ],
        [
          [
            variation.immutables.orderHash,
            variation.immutables.hashlock,
            variation.immutables.maker,
            variation.immutables.taker,
            variation.immutables.token,
            variation.immutables.amount,
            variation.immutables.safetyDeposit,
            [
              variation.immutables.timelocks.deployedAt,
              variation.immutables.timelocks.srcWithdrawal,
              variation.immutables.timelocks.srcCancellation,
              variation.immutables.timelocks.dstWithdrawal,
              variation.immutables.timelocks.dstCancellation,
            ],
          ],
        ]
      );

      const hash = ethers.keccak256(encoded);
      console.log(`✅ Hash: ${hash}`);
      console.log(`✅ Encoded length: ${encoded.length}`);
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }

  console.log("\n🔍 HASH TESTING COMPLETE");
  console.log("========================");
  console.log("If all hash computations succeed, the issue is likely:");
  console.log("1. EscrowFactory bytecode hash not initialized");
  console.log("2. Gas limit too low for CREATE2 computation");
  console.log("3. Missing library functions in deployed contract");
  console.log("4. Constructor parameters incorrect during deployment");
}

main().catch(console.error);
