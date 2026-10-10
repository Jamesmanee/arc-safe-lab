# Arc Safe Lab — Testnet Only

A clean, minimal, **security-focused** wallet demo for the **Arc Testnet**.

Arc Safe Lab is a learning/reference project exploring safe patterns for
building wallet-connected dApps. It is built to be safe to run, read, and
share publicly.

## Current scope

**Gate 1 — read-only wallet connection.** This is the only functionality that
exists today. The app connects to an injected browser wallet and displays
public, read-only state. It cannot move funds or sign anything.

## Arc Testnet only

This project targets the **Arc Testnet** exclusively.

- Expected chain ID: **5042002**
- There are **no mainnet code paths** and no mainnet actions of any kind.

If the connected wallet is on any other network, the app shows a clear
wrong-network warning.

## Security principles

- **Read-only.** The app calls only `eth_requestAccounts` (to read the
  address) and `eth_chainId` (to read the network), and listens for
  `accountsChanged` / `chainChanged` to keep the display in sync.
- **No funds can move.** It does not send transactions, request token
  approvals, or sign messages.
- **No secrets.** It never asks for private keys, seed phrases, mnemonics, or
  API keys, and reads no environment variables.
- **Explicit consent.** Account access is requested only after the user clicks
  **Connect** — nothing happens on page load.
- **Testnet only.** No mainnet network is referenced or supported.

## Features

- Injected-wallet discovery via **EIP-6963** (Multi Injected Provider
  Discovery), preferring **MetaMask** when multiple wallets are present.
- Displays:
  - connected wallet address
  - current chain ID
  - whether the wallet is on Arc Testnet (chain ID 5042002)
  - a wrong-network warning when it is not
- Disconnect that clears local UI state.

## Local setup

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open the printed local URL and click **Connect (read-only)**. To use Arc
Testnet, add the network to your wallet (chain ID `5042002`).

Build and checks:

```bash
npm run build   # type-check + production build
npm run lint    # oxlint
npm audit       # dependency vulnerability check
```

## Project layout

```
src/
  App.tsx            UI: connect, display address / chain / network
  wallet/eip6963.ts  EIP-6963 wallet discovery (read-only EIP-1193 surface)
  wallet/arc.ts      Arc Testnet constants and chain-ID helpers
```

## Current limitations

- Read-only only — no transactions, approvals, or message signing.
- No token balances are read or displayed.
- No network-switching is performed on the user's behalf (the app warns; it
  does not call `wallet_switchEthereumChain`).
- Requires a browser wallet that supports EIP-6963.

## Roadmap — NOT implemented

The following are **planned ideas only** and **do not exist in the current
code**. None of them work today:

- ⛔ Read USDC balance — *not implemented*
- ⛔ Safe testnet transaction review — *not implemented*
- ⛔ Circle App Kit experiments — *not implemented* (Circle packages are **not**
  a dependency of this project)
- ⛔ Smart-contract experiments — *not implemented*

Each item above will only be considered in a later, clearly-scoped gate.
