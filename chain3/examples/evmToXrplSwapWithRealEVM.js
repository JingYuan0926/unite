require("dotenv").config();
const crypto = require("crypto");
const { ethers } = require("ethers");
const xrpl = require("xrpl");
const { XRPLEscrowClient, XRPLEscrowUtils } = require("../xrpl-tee/client.js");

class EnhancedCrossChainSwap {
  // The constructor and initialize method remain the same as in commit 1.

  async createSwap(swapParams) {
    const swapId = crypto.randomUUID();
    console.log(`🔄 Creating enhanced cross-chain swap ${swapId}`);

    // Generate swap identifiers
    const secret = XRPLEscrowClient.generateSecret();
    const hashlock = XRPLEscrowClient.hashSecret(secret);
    // Add timestamp to ensure uniqueness and prevent salt collision
    const orderHash =
      "0x" +
      crypto
        .createHash("sha256")
        .update(crypto.randomBytes(32).toString("hex") + Date.now().toString())
        .digest("hex");

    console.log(`📋 Order Hash: ${orderHash}`);
    console.log(`🔐 Hashlock: ${hashlock}`);
    console.log(`🔑 Secret: ${secret}`);

    // Set up timelocks with safer values to avoid validation issues
    // Use current block timestamp to avoid timing mismatches
    const currentBlock = await this.evmProvider.getBlock("latest");
    const blockTimestamp = currentBlock.timestamp;

    // Make sure DstCancellation is well before SrcCancellation
    const timelocks = {
      0: blockTimestamp + 600, // SrcWithdrawal: 10 minutes
      1: blockTimestamp + 900, // SrcPublicWithdrawal: 15 minutes
      2: blockTimestamp + 3600, // SrcCancellation: 60 minutes
      3: blockTimestamp + 4200, // SrcPublicCancellation: 70 minutes
      4: blockTimestamp + 300, // DstWithdrawal: 5 minutes
      5: blockTimestamp + 600, // DstPublicWithdrawal: 10 minutes
      6: blockTimestamp + 1800, // DstCancellation: 30 minutes (well before SrcCancellation)
    };

    const packedTimelocks = XRPLEscrowUtils.packTimelocks(
      timelocks,
      blockTimestamp
    );

    // For EVM contract, we need to pack timelocks differently with relative offsets
    // The contract will call setDeployedAt which sets the deployment timestamp
    // So we need to pass relative offsets, not absolute timestamps
    const evmPackedTimelocks =
      BigInt(600) | // SrcWithdrawal offset (stage 0)
      (BigInt(900) << 32n) | // SrcPublicWithdrawal offset (stage 1)
      (BigInt(3600) << 64n) | // SrcCancellation offset (stage 2)
      (BigInt(4200) << 96n) | // SrcPublicCancellation offset (stage 3)
      (BigInt(300) << 128n) | // DstWithdrawal offset (stage 4)
      (BigInt(600) << 160n) | // DstPublicWithdrawal offset (stage 5)
      (BigInt(1800) << 192n); // DstCancellation offset (stage 6)

    try {
      // Step 1: Create XRPL destination escrow
      console.log("🏗️  Creating XRPL destination escrow...");
      const xrplEscrowParams = {
        orderHash: orderHash,
        hashlock: hashlock,
        maker: swapParams.xrplMaker,
        taker: swapParams.xrplTaker,
        token: swapParams.dstToken,
        amount: swapParams.dstAmount,
        safetyDeposit: swapParams.safetyDeposit,
        timelocks: packedTimelocks,
        srcCancellationTimestamp: timelocks[2],
      };

      XRPLEscrowUtils.validateEscrowParams(xrplEscrowParams);
      const xrplEscrow =
        await this.teeClient.createDestinationEscrow(xrplEscrowParams);

      console.log(`✅ XRPL Escrow created with ID: ${xrplEscrow.escrowId}`);
      console.log(`📍 Escrow wallet address: ${xrplEscrow.walletAddress}`);

      // Step 2: Create EVM destination escrow
      console.log("🏗️  Creating EVM destination escrow...");
      const evmImmutables = {
        orderHash: orderHash,
        hashlock: hashlock,
        maker: BigInt(swapParams.evmMaker), // Convert address to uint256
        taker: BigInt(swapParams.evmTaker), // Convert address to uint256
        token: BigInt(swapParams.srcToken), // Convert address to uint256
        amount: ethers.parseEther(swapParams.srcAmount),
        safetyDeposit: ethers.parseEther("0.01"), // 0.01 ETH safety deposit
        timelocks: evmPackedTimelocks,
      };

      // Calculate required ETH for the escrow
      let requiredEth = evmImmutables.safetyDeposit;
      if (
        swapParams.srcToken === "0x0000000000000000000000000000000000000000"
      ) {
        // Native ETH transfer
        requiredEth += evmImmutables.amount;
      }

      console.log("💰 Required ETH:", ethers.formatEther(requiredEth));

      // Try to simulate the call first to get better error information
      try {
        await this.escrowFactory.createDstEscrow.staticCall(
          evmImmutables,
          timelocks[2], // srcCancellationTimestamp
          { value: requiredEth }
        );
        console.log("✅ Static call successful");
      } catch (staticError) {
        console.error("❌ Static call failed:", staticError.message);
        throw staticError;
      }

      const tx = await this.escrowFactory.createDstEscrow(
        evmImmutables,
        timelocks[2], // srcCancellationTimestamp
        {
          value: requiredEth,
          gasLimit: 500000, // Set explicit gas limit
        }
      );

      console.log(`⏳ Waiting for EVM escrow creation transaction: ${tx.hash}`);
      const receipt = await tx.wait();

      // Find the DstEscrowCreated event
      const escrowCreatedEvent = receipt.logs.find((log) => {
        try {
          const parsed = this.escrowFactory.interface.parseLog(log);
          return parsed.name === "DstEscrowCreated";
        } catch {
          return false;
        }
      });

      if (!escrowCreatedEvent) {
        throw new Error("EVM escrow creation event not found");
      }

      const parsedEvent =
        this.escrowFactory.interface.parseLog(escrowCreatedEvent);
      const evmEscrowAddress = parsedEvent.args.escrow;

      console.log(`✅ EVM Escrow created at: ${evmEscrowAddress}`);
      console.log(`📝 Transaction hash: ${tx.hash}`);

      // Store swap state
      const swap = {
        id: swapId,
        orderHash,
        hashlock,
        secret,
        status: "created",
        xrplEscrow: {
          id: xrplEscrow.escrowId,
          walletAddress: xrplEscrow.walletAddress,
          requiredDeposit: xrplEscrow.requiredDeposit.xrp,
        },
        evmEscrow: {
          address: evmEscrowAddress,
          transactionHash: tx.hash,
        },
        timelocks,
        evmPackedTimelocks,
        evmImmutables,
        swapParams,
      };

      this.activeSwaps.set(swapId, swap);

      return swap;
    } catch (error) {
      console.error(`❌ Failed to create swap ${swapId}:`, error.message);
      throw error;
    }
  }
}

module.exports = {
  EnhancedCrossChainSwap,
};
