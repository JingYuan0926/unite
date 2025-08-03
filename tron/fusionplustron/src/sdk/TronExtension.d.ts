import TronWeb from "tronweb";
import { ConfigManager } from "../utils/ConfigManager";
import { ScopedLogger } from "../utils/Logger";
export interface TronEscrowParams {
    orderHash: string;
    secretHash: string;
    srcChain: number;
    dstChain: number;
    srcAsset: string;
    dstAsset: string;
    srcAmount: string;
    dstAmount: string;
    nonce: string;
    srcBeneficiary: string;
    dstBeneficiary: string;
    srcCancellationBeneficiary: string;
    dstCancellationBeneficiary: string;
    timelock: number;
    safetyDeposit: string;
}
export interface TronNetworkInfo {
    blockNumber: number;
    network: string;
    chainId: number;
}
export interface TronTransactionResult {
    txHash: string;
    success: boolean;
    contractAddress?: string;
    immutables?: any[];
}
/**
 * Tron Extension for cross-chain functionality
 * Handles Tron-specific operations for the Fusion+ integration
 */
export declare class TronExtension {
    private tronWeb;
    private config;
    private logger;
    constructor(config: ConfigManager, logger: ScopedLogger);
    /**
     * Create TronWeb instance with specific private key
     */
    createTronWebInstance(privateKey: string): TronWeb;
    /**
     * Deploy Tron escrow destination contract
     */
    deployTronEscrowDst(params: TronEscrowParams, privateKey: string): Promise<TronTransactionResult>;
    /**
     * Deploy Tron escrow source contract (for TRX → ETH flow)
     * User A locks TRX on Tron while User B locks ETH on Ethereum
     */
    deployTronEscrowSrc(params: TronEscrowParams, privateKey: string): Promise<TronTransactionResult>;
    /**
     * Withdraw from Tron escrow using secret
     */
    withdrawFromTronEscrow(escrowAddress: string, secret: string, exactImmutables: any[], // Use exact immutables from creation
    privateKey: string): Promise<TronTransactionResult>;
    /**
     * Cancel Tron escrow after timelock expiry
     */
    cancelTronEscrow(escrowAddress: string, immutables: TronEscrowParams, privateKey: string): Promise<TronTransactionResult>;
    /**
     * Get Tron escrow status
     */
    getTronEscrowStatus(escrowAddress: string): Promise<any>;
    /**
     * Generate secret hash for atomic swap
     */
    generateSecretHash(): {
        secret: string;
        secretHash: string;
    };
    /**
     * Create packed timelocks for EVM contract compatibility
     * Replicates the Solidity _createTimelocks function bit-shifting logic
     *
     * @param timelock - User-defined timelock duration in seconds
     * @returns Packed uint256 value as bigint
     */
    createPackedTimelocks(timelock: number): bigint;
    /**
     * Get Tron address from private key
     */
    getTronAddressFromPrivateKey(privateKey: string): string;
    /**
     * Create timelocks structure for escrow (legacy - now uses packed timelocks)
     * @deprecated Use createPackedTimelocks() for EVM contract compatibility
     */
    createTimelocks(timelock: number): any;
    /**
     * Get Tron network information
     */
    getTronNetworkInfo(): Promise<TronNetworkInfo>;
    /**
     * Get TRX balance for address
     */
    getTrxBalance(address: string): Promise<string>;
    /**
     * Convert TRX to Sun (smallest unit)
     */
    toSun(trxAmount: string): string;
    /**
     * Convert Sun to TRX
     */
    fromSun(sunAmount: string): string;
    /**
     * Validate Tron address format
     */
    isValidTronAddress(address: string): boolean;
    /**
     * Get current timestamp
     */
    getCurrentTimestamp(): number;
    /**
     * Wait for transaction confirmation
     */
    waitForConfirmation(txHash: string, timeoutMs?: number): Promise<any>;
    /**
     * Get detailed transaction information using Tron API
     */
    getTronTransactionDetails(txHash: string): Promise<string>;
}
//# sourceMappingURL=TronExtension.d.ts.map