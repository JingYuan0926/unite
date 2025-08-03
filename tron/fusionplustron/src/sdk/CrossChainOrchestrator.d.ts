import { ConfigManager } from "../utils/ConfigManager";
import { ScopedLogger } from "../utils/Logger";
export interface SwapParams {
    ethAmount: bigint;
    ethPrivateKey: string;
    tronPrivateKey: string;
    tronRecipient: string;
    timelock?: number;
}
export interface SwapResult {
    orderHash: string;
    ethEscrowAddress: string;
    tronEscrowAddress: string;
    secret: string;
    secretHash: string;
    ethTxHash: string;
    tronTxHash: string;
    tronImmutables?: any;
}
export interface SwapStatus {
    orderStatus: string;
    ethEscrowStatus: any;
    tronEscrowStatus: any;
    canWithdraw: boolean;
    canCancel: boolean;
}
/**
 * Orchestrates ETH <-> TRX swaps using the official 1inch Resolver for atomic execution
 * This is the main coordinator that ties together all components for cross-chain swaps
 */
export declare class CrossChainOrchestrator {
    private config;
    private logger;
    private official1inch;
    private tronExtension;
    private resolverContract;
    private userA_ethSigner;
    private userA_tronAddress;
    private userB_ethSigner;
    private userB_tronPrivateKey;
    private userB_ethAddress;
    constructor(config: ConfigManager, logger: ScopedLogger);
    /**
     * Execute ETH -> TRX atomic swap
     * Uses Resolver contract to atomically fill order and create escrow
     */
    executeETHtoTRXSwap(params: SwapParams): Promise<SwapResult>;
    /**
     * Execute TRX -> ETH atomic swap
     * User A locks TRX on Tron, User B locks ETH on Ethereum
     */
    executeTRXtoETHSwap(params: SwapParams): Promise<SwapResult>;
    /**
     * Withdraw from completed swap using secret
     */
    withdrawFromSwap(swapResult: SwapResult, privateKey: string, network: "ethereum" | "tron"): Promise<string>;
    /**
     * Cancel expired swap
     */
    cancelSwap(swapResult: SwapResult, privateKey: string, network: "ethereum" | "tron"): Promise<string>;
    /**
     * Get swap status
     */
    getSwapStatus(swapResult: SwapResult): Promise<SwapStatus>;
    /**
     * Monitor swap progress
     */
    monitorSwap(swapResult: SwapResult, onProgress?: (status: SwapStatus) => void): Promise<SwapStatus>;
    private calculateEscrowAddress;
    private getEthEscrowStatus;
    private reconstructImmutables;
    /**
     * Claim/withdraw from completed atomic swap
     * This is the final step that releases locked funds using the secret
     */
    claimAtomicSwap(swapResult: SwapResult, secret: string, ethPrivateKey: string, tronPrivateKey?: string): Promise<void>;
    /**
     * Withdraw ETH from DemoResolver (simplified escrow)
     */
    private withdrawFromEthereumEscrow;
    /**
     * Withdraw TRX from Tron escrow using the secret
     */
    private withdrawFromTronEscrow;
    /**
     * Cancel atomic swap (if timelock expired)
     */
    cancelAtomicSwap(swapResult: SwapResult, userPrivateKey: string): Promise<void>;
    /**
     * Cancel Ethereum escrow (recover ETH after timeout)
     */
    private cancelEthereumEscrow;
    /**
     * Cancel Tron escrow (recover TRX after timeout)
     */
    private cancelTronEscrow;
    private reconstructTronImmutables;
}
//# sourceMappingURL=CrossChainOrchestrator.d.ts.map