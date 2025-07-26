# 1inch Agent Kit - Function Reference

This document is auto-generated from the function schemas.

## Available Functions

### getQuote

Get a quote for swapping tokens on 1inch. This function returns the best swap route and estimated output amount for a given input token, output token, and amount.

**Parameters:**
- `chainId` (integer, required): The blockchain network ID
- `src` (string, required): The source token address
- `dst` (string, required): The destination token address
- `amount` (string, required): The amount of source tokens to swap
- `from` (string, optional): The wallet address that will execute the swap
- `slippage` (number, optional): Maximum acceptable slippage percentage
- `disableEstimate` (boolean, optional): Disable gas estimation
- `gasPrice` (string, optional): Gas price in wei
- `complexityLevel` (integer, optional): Complexity level for route calculation
- `mainRouteParts` (integer, optional): Number of main route parts
- `parts` (integer, optional): Number of parts to split the swap
- `gasLimit` (integer, optional): Gas limit for the transaction
- `referrer` (string, optional): Referrer address for fee sharing
- `receiver` (string, optional): Address to receive the swapped tokens
- `source` (string, optional): Source identifier for tracking

### swap

Execute a token swap on 1inch. This function creates a swap transaction that can be executed on the blockchain.

**Parameters:**
- `chainId` (integer, required): The blockchain network ID
- `src` (string, required): The source token address
- `dst` (string, required): The destination token address
- `amount` (string, required): The amount of source tokens to swap
- `from` (string, required): The wallet address that will execute the swap
- `slippage` (number, required): Maximum acceptable slippage percentage
- `disableEstimate` (boolean, optional): Disable gas estimation
- `gasPrice` (string, optional): Gas price in wei
- `complexityLevel` (integer, optional): Complexity level for route calculation
- `mainRouteParts` (integer, optional): Number of main route parts
- `parts` (integer, optional): Number of parts to split the swap
- `gasLimit` (integer, optional): Gas limit for the transaction
- `referrer` (string, optional): Referrer address for fee sharing
- `receiver` (string, optional): Address to receive the swapped tokens
- `source` (string, optional): Source identifier for tracking
- `allowPartialFill` (boolean, optional): Allow partial fill of the swap order
- `permit` (string, optional): Permit signature for token approval
- `burnChi` (boolean, optional): Burn CHI token to reduce gas costs
- `destReceiver` (string, optional): Destination receiver address

### healthCheck

Check the health status of 1inch API. This function returns the current status of the API and supported chains.

**Parameters:**
- `chainId` (integer, optional): Optional chain ID to check health for a specific chain 