const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EscrowFactory Contract", function () {
  let escrowFactory;
  let owner, user, resolver;

  beforeEach(async function () {
    // Get signers
    [owner, user, resolver] = await ethers.getSigners();

    // Deploy EscrowFactory
    const EscrowFactory = await ethers.getContractFactory("EscrowFactory");
    escrowFactory = await EscrowFactory.deploy();
    await escrowFactory.waitForDeployment();
  });

  describe("Contract Deployment", function () {
    it("Should deploy with correct constants", async function () {
      expect(await escrowFactory.FINALITY_BLOCKS()).to.equal(20);
      expect(await escrowFactory.MIN_CANCEL_DELAY()).to.equal(1800);
      expect(await escrowFactory.REVEAL_DELAY()).to.equal(60);
      expect(await escrowFactory.MIN_SAFETY_DEPOSIT()).to.equal(
        ethers.parseEther("0.001")
      );
    });
  });

  describe("Escrow Creation", function () {
    it("Should create ETH escrow successfully", async function () {
      const amount = ethers.parseEther("0.1");
      const safetyDeposit = ethers.parseEther("0.001");
      const secretHash = ethers.keccak256(ethers.toUtf8Bytes("secret123"));
      const cancelDelay = 1800; // 30 minutes

      const tx = await escrowFactory.connect(user).createEscrow(
        resolver.address,
        ethers.ZeroAddress, // ETH
        amount,
        secretHash,
        cancelDelay,
        { value: amount + safetyDeposit }
      );

      expect(tx).to.emit(escrowFactory, "EscrowCreated");
    });

    it("Should fail with insufficient safety deposit", async function () {
      const amount = ethers.parseEther("0.1");
      const secretHash = ethers.keccak256(ethers.toUtf8Bytes("secret123"));
      const cancelDelay = 1800;

      await expect(
        escrowFactory.connect(user).createEscrow(
          resolver.address,
          ethers.ZeroAddress,
          amount,
          secretHash,
          cancelDelay,
          { value: amount } // Missing safety deposit
        )
      ).to.be.revertedWithCustomError(
        escrowFactory,
        "InsufficientSafetyDeposit"
      );
    });

    it("Should fail with insufficient cancel delay", async function () {
      const amount = ethers.parseEther("0.1");
      const safetyDeposit = ethers.parseEther("0.001");
      const secretHash = ethers.keccak256(ethers.toUtf8Bytes("secret123"));
      const cancelDelay = 1000; // Less than minimum

      await expect(
        escrowFactory
          .connect(user)
          .createEscrow(
            resolver.address,
            ethers.ZeroAddress,
            amount,
            secretHash,
            cancelDelay,
            { value: amount + safetyDeposit }
          )
      ).to.be.revertedWithCustomError(escrowFactory, "InsufficientTimeBuffer");
    });
  });

  describe("MEV Protection", function () {
    let escrowId;
    const secret = "secret123";
    const nonce = "nonce456";

    beforeEach(async function () {
      const amount = ethers.parseEther("0.1");
      const safetyDeposit = ethers.parseEther("0.001");
      const secretHash = ethers.keccak256(ethers.toUtf8Bytes(secret));
      const cancelDelay = 1800;

      const tx = await escrowFactory
        .connect(user)
        .createEscrow(
          resolver.address,
          ethers.ZeroAddress,
          amount,
          secretHash,
          cancelDelay,
          { value: amount + safetyDeposit }
        );

      const receipt = await tx.wait();
      const event = receipt.logs.find((log) => {
        try {
          return escrowFactory.interface.parseLog(log).name === "EscrowCreated";
        } catch {
          return false;
        }
      });
      escrowId = escrowFactory.interface.parseLog(event).args[0];
    });

    it("Should require secret commit before reveal", async function () {
      // Wait for finality
      await ethers.provider.send("hardhat_mine", ["0x15"]); // Mine 21 blocks

      await expect(
        escrowFactory
          .connect(resolver)
          .revealAndWithdraw(
            escrowId,
            ethers.toUtf8Bytes(secret),
            ethers.toUtf8Bytes(nonce)
          )
      ).to.be.revertedWithCustomError(escrowFactory, "SecretNotCommitted");
    });

    it("Should enforce reveal delay", async function () {
      // Commit secret
      const secretCommit = ethers.keccak256(
        ethers.concat([ethers.toUtf8Bytes(secret), ethers.toUtf8Bytes(nonce)])
      );
      await escrowFactory.connect(resolver).commitSecret(secretCommit);

      // Wait for finality but not reveal delay
      await ethers.provider.send("hardhat_mine", ["0x15"]); // Mine 21 blocks

      await expect(
        escrowFactory
          .connect(resolver)
          .revealAndWithdraw(
            escrowId,
            ethers.toUtf8Bytes(secret),
            ethers.toUtf8Bytes(nonce)
          )
      ).to.be.revertedWithCustomError(escrowFactory, "RevealTooEarly");
    });
  });

  describe("Escrow Completion", function () {
    it("Should complete escrow successfully with MEV protection", async function () {
      const amount = ethers.parseEther("0.1");
      const safetyDeposit = ethers.parseEther("0.001");
      const secret = "secret123";
      const nonce = "nonce456";
      const secretHash = ethers.keccak256(ethers.toUtf8Bytes(secret));
      const cancelDelay = 1800;

      // Create escrow
      const tx = await escrowFactory
        .connect(user)
        .createEscrow(
          resolver.address,
          ethers.ZeroAddress,
          amount,
          secretHash,
          cancelDelay,
          { value: amount + safetyDeposit }
        );

      const receipt = await tx.wait();
      const event = receipt.logs.find((log) => {
        try {
          return escrowFactory.interface.parseLog(log).name === "EscrowCreated";
        } catch {
          return false;
        }
      });
      const escrowId = escrowFactory.interface.parseLog(event).args[0];

      // Commit secret
      const secretCommit = ethers.keccak256(
        ethers.concat([ethers.toUtf8Bytes(secret), ethers.toUtf8Bytes(nonce)])
      );
      await escrowFactory.connect(resolver).commitSecret(secretCommit);

      // Wait for finality and reveal delay
      await ethers.provider.send("hardhat_mine", ["0x15"]); // Mine 21 blocks
      await ethers.provider.send("evm_increaseTime", [61]); // Increase time by 61 seconds
      await ethers.provider.send("evm_mine"); // Mine a block

      // Record resolver balance before
      const resolverBalanceBefore = await ethers.provider.getBalance(
        resolver.address
      );

      // Reveal and withdraw
      const revealTx = await escrowFactory
        .connect(resolver)
        .revealAndWithdraw(
          escrowId,
          ethers.toUtf8Bytes(secret),
          ethers.toUtf8Bytes(nonce)
        );

      expect(revealTx).to.emit(escrowFactory, "EscrowCompleted");

      // Check resolver received funds
      const resolverBalanceAfter = await ethers.provider.getBalance(
        resolver.address
      );
      expect(resolverBalanceAfter).to.be.gt(resolverBalanceBefore);
    });
  });

  describe("Escrow Cancellation", function () {
    it("Should cancel escrow after timeout", async function () {
      const amount = ethers.parseEther("0.1");
      const safetyDeposit = ethers.parseEther("0.001");
      const secretHash = ethers.keccak256(ethers.toUtf8Bytes("secret123"));
      const cancelDelay = 1800;

      // Create escrow
      const tx = await escrowFactory
        .connect(user)
        .createEscrow(
          resolver.address,
          ethers.ZeroAddress,
          amount,
          secretHash,
          cancelDelay,
          { value: amount + safetyDeposit }
        );

      const receipt = await tx.wait();
      const event = receipt.logs.find((log) => {
        try {
          return escrowFactory.interface.parseLog(log).name === "EscrowCreated";
        } catch {
          return false;
        }
      });
      const escrowId = escrowFactory.interface.parseLog(event).args[0];

      // Wait for cancel delay
      await ethers.provider.send("evm_increaseTime", [1801]); // 30 minutes + 1 second
      await ethers.provider.send("evm_mine");

      // Record user balance before
      const userBalanceBefore = await ethers.provider.getBalance(user.address);

      // Cancel escrow
      const cancelTx = await escrowFactory.connect(user).cancel(escrowId);
      expect(cancelTx).to.emit(escrowFactory, "EscrowCancelled");

      // Check user received refund (accounting for gas costs)
      const userBalanceAfter = await ethers.provider.getBalance(user.address);
      expect(userBalanceAfter).to.be.gt(userBalanceBefore);
    });
  });
});
