export const EscrowFactoryABI = [
  // Events
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "escrowId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "initiator",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "resolver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "secretHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "finalityLock",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "cancelLock",
        type: "uint64",
      },
    ],
    name: "EscrowCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "escrowId",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "secret",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "resolver",
        type: "address",
      },
    ],
    name: "EscrowCompleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "escrowId",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "initiator",
        type: "address",
      },
    ],
    name: "EscrowCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "secretCommit",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "committer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "timestamp",
        type: "uint64",
      },
    ],
    name: "SecretCommitted",
    type: "event",
  },

  // Read Functions
  {
    inputs: [{ internalType: "bytes32", name: "escrowId", type: "bytes32" }],
    name: "escrows",
    outputs: [
      { internalType: "address", name: "initiator", type: "address" },
      { internalType: "address", name: "resolver", type: "address" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "safetyDeposit", type: "uint256" },
      { internalType: "bytes32", name: "secretHash", type: "bytes32" },
      { internalType: "uint64", name: "finalityLock", type: "uint64" },
      { internalType: "uint64", name: "cancelLock", type: "uint64" },
      { internalType: "uint64", name: "createdAt", type: "uint64" },
      { internalType: "bool", name: "completed", type: "bool" },
      { internalType: "bool", name: "cancelled", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "secretCommit", type: "bytes32" },
    ],
    name: "secretCommits",
    outputs: [{ internalType: "uint64", name: "timestamp", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "REVEAL_DELAY",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },

  // Write Functions
  {
    inputs: [
      { internalType: "address", name: "resolver", type: "address" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bytes32", name: "secretHash", type: "bytes32" },
      { internalType: "uint64", name: "finalityLock", type: "uint64" },
      { internalType: "uint64", name: "cancelLock", type: "uint64" },
    ],
    name: "createEscrow",
    outputs: [{ internalType: "bytes32", name: "escrowId", type: "bytes32" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "secretCommit", type: "bytes32" },
    ],
    name: "commitSecret",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "escrowId", type: "bytes32" },
      { internalType: "bytes32", name: "secret", type: "bytes32" },
      { internalType: "bytes32", name: "nonce", type: "bytes32" },
    ],
    name: "revealAndWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "escrowId", type: "bytes32" }],
    name: "cancel",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // Emergency Functions (Owner only)
  {
    inputs: [
      { internalType: "bytes32", name: "escrowId", type: "bytes32" },
      { internalType: "address", name: "recipient", type: "address" },
    ],
    name: "emergencyWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
