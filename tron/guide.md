# 🚀 1inch Fusion+ Cross‑Chain Swap ─ OP Sepolia ↔ Tron

**Build Guide · README.md**  
_Last updated: 2025‑07‑28_

This document is a **copy‑pasteable recipe** for bootstrapping a cross‑chain swap between **Optimism Sepolia** (EVM) and **Tron Nile** (TVM) by **re‑using 1inch’s open‑source Fusion+ code‑bases** instead of writing everything from scratch.

---

## 0 · Quick glance

```mermaid
flowchart LR
    subgraph EVM (OP Sepolia)
        style OP fill:#f6f8fa,stroke:#c5cdd3
        Maker1(Maker wallet)
        Resolver1(Resolver bot)
        EscrowSrc[[Escrow Src
—from 1inch cross‑chain‑swap]]
    end
    subgraph TVM (Tron Nile)
        style TVM fill:#f6f8fa,stroke:#c5cdd3
        Taker1(Taker wallet)
        Resolver2(Resolver bot — same process)
        EscrowDst[[Escrow Dst
— compiled by TronBox]]
    end
    Maker1 -- createEscrow --> EscrowSrc
    EscrowSrc -- event --> Resolver1
    Resolver1 == mirror escrow & reveal secret ==> EscrowDst
    EscrowDst -- withdraw --> Taker1
    EscrowSrc -- withdraw --> Maker1
```

* **EVM‑side contracts & scripts** → cloned from `1inch/cross-chain-swap`.  
* **Resolver logic / SDK helpers** → cloned from `1inch/fusion-resolver-example`.  
* **TVM deployment & calls** → minimal edits to compile and invoke the _same_ Solidity byte‑code on Tron.

---

## 1 · Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | ≥ 18.17 | <https://nodejs.org/> |
| **pnpm** | ≥ 8 | `npm i -g pnpm` |
| **Hardhat** | auto‑installed | via `pnpm i` |
| **Foundry** | latest | <https://getfoundry.sh> |
| **TronBox** | ≥ 3.3 | `npm i -g tronbox` |
| **TronWeb** | ≥ 5.2 (code only) | auto‑installed |
| **Git**, **Docker** (optional) | — | — |

Create two funded test wallets:

* `OP_SEPOLIA_PK` — 0.05 ETH on **https://optimismfaucet.com/**  
* `TRON_NILE_PK` — 100 TRX + test‑USDT on **https://nileex.io/faucet/**

---

## 2 · Clone the template repos

```bash
# 2.1 Contracts + tests
git clone https://github.com/1inch/cross-chain-swap.git fusion-cross
cd fusion-cross
pnpm i
# run unit tests (Foundry + Hardhat)
pnpm test
cd ..

# 2.2 Resolver example + Fusion SDK
git clone https://github.com/1inch/fusion-resolver-example.git fusion-resolver
cd fusion-resolver
pnpm i
cd ..
```

Directory layout you will have:

```
fusion-cross      ─ contracts, deploy/, foundry.toml
fusion-resolver   ─ contracts/ResolverExample.sol, src/, .env.example
```

---

## 3 · Edit contracts for OP Sepolia + Tron

### 3.1 Solidity (shared)

*Open `fusion-cross/contracts/EscrowConfig.sol`*

```solidity
uint64 public constant FINALITY_LOCK = 20;   // ≈ 40 s on OP Sepolia
uint64 public constant CANCEL_LOCK   = 1800; // 30 min
```

No other Solidity changes are needed. The byte‑code is chain‑agnostic.

### 3.2 Hardhat config (OP Sepolia)

*In `fusion-cross/hardhat.config.ts` add:*

```ts
networks.opSepolia = {
  url: "https://sepolia.optimism.io",
  chainId: 11155420,
  accounts: [process.env.OP_SEPOLIA_PK!]
};
```

### 3.3 TronBox config (Tron Nile)

Create `fusion-cross/tronbox.js`:

```js
module.exports = {
  networks: {
    nile: {
      privateKey: process.env.TRON_NILE_PK,
      consume_user_resource_percent: 30,
      fee_limit: 1_000_000_000,
      fullHost: "https://api.nileex.io"
    }
  }
};
```

Copy `EscrowSrc.sol`, `EscrowDst.sol`, and `EscrowFactory.sol` into `fusion-cross/tron/contracts/` so TronBox can compile them.

---

## 4 · Deploy escrows

```bash
# EVM side
cd fusion-cross
npx hardhat deploy --network opSepolia
# ➜ note the EscrowFactory/EscrowSrc addresses

# TVM side
tronbox migrate --network nile
# ➜ note the EscrowDst address
cd ..
```

Save the three addresses in a `.env` you’ll share with the resolver:

```
OP_FACTORY=0xEscrowFactory...
OP_SRC=0xEscrowSrc...
TRON_DST=TDsEscrowDst...
```

---

## 5 · Configure the resolver bot

```bash
cd fusion-resolver
cp .env.example .env
```

**.env**

```
PROVIDER_OP="https://sepolia.optimism.io"
PROVIDER_TRON="https://api.nileex.io"
PRIVATE_KEYS='["OP_SEPOLIA_PK","TRON_NILE_PK"]'

OP_FACTORY=$OP_FACTORY
TRON_DST=$TRON_DST
```

Edit `src/config/chains.ts` to add:

```ts
export const CHAINS = {
  11155420: {                        // OP Sepolia
    name: "optimism-sepolia",
    escrow: process.env.OP_SRC!,
    explorer: "https://optimistic.etherscan.io"
  },
  3448148188: {                      // Tron Nile
    name: "tron-nile",
    escrow: process.env.TRON_DST!,
    explorer: "https://nile.tronscan.org"
  }
};
```

---

## 6 · Run integration tests locally

```bash
# EVM fork + TVM local node (docker) in parallel terminals
pnpm dev:fork           # Hardhat fork of OP Sepolia
docker run -p 9090:9090 tronquickstart/nile   # Nile devnet

# Execute tests
pnpm test:e2e
```

Passing tests show escrow creation, secret reveal, withdraw, cancel on timeout.

---

## 7 · Live demo flow

1. **Maker script** – creates an order via `@1inch/fusion-sdk` targeting `dstChainId = 3448148188`.  
2. **Resolver bot** – auto‑picks the order, funds `EscrowSrc` on OP Sepolia.  
3. After 20 blocks, bot mirrors funds into `EscrowDst` on Tron.  
4. Bot reveals secret to both chains ⇒ tokens swap, safety deposits refunded.  
5. Show tx hashes on Optimistic Etherscan & TronScan.

---

## 8 · Port to other EVM chains (optional)

Only tasks:

```bash
# Add new network
npx hardhat deploy --network baseSepolia
#   – edit chains.ts with chainId 84532 and escrow address
# Swap script
npx hardhat swap:base2tron ...
```

---

## 9 · CI pipeline

*GitHub Actions `ci.yml`:*

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with: { version: 8 }
      - run: pnpm i --frozen-lockfile
      - run: pnpm -C fusion-cross test
      - run: pnpm -C fusion-resolver test
```

---

## 10 · Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Error: insufficient Energy` on Tron | Freeze some TRX for Energy or raise `fee_limit`. |
| `withdraw: secretHash mismatch` | Ensure resolver passes the *preimage*, not the hash. |
| Order never appears in resolver logs | Check Fusion order‑book endpoint and that `dstChainId` custom field is set. |

---

## 11 · Next steps

* Implement **partial fill** with Merkle‑secrets (already in the 1inch repo).  
* Build a React dashboard: chain selector, order book, live tx status.  
* Deploy to **OP Main‑net** and **Tron Main‑net** after audits.

---

