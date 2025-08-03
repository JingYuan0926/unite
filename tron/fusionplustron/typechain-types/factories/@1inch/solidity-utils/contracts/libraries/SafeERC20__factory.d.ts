import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { SafeERC20, SafeERC20Interface } from "../../../../../@1inch/solidity-utils/contracts/libraries/SafeERC20";
type SafeERC20ConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class SafeERC20__factory extends ContractFactory {
    constructor(...args: SafeERC20ConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<SafeERC20 & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): SafeERC20__factory;
    static readonly bytecode = "0x60808060405234601757603a9081601d823930815050f35b600080fdfe600080fdfea26469706673582212206087e2fc72cfc1bd72312ddc0cf805edae72ef63cf59295fd6f8e94de6d692e364736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "ForceApproveFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "Permit2TransferAmountTooHigh";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "SafeDecreaseAllowanceFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "SafeIncreaseAllowanceFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "SafePermitBadLength";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "SafeTransferFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "SafeTransferFromFailed";
        readonly type: "error";
    }];
    static createInterface(): SafeERC20Interface;
    static connect(address: string, runner?: ContractRunner | null): SafeERC20;
}
export {};
//# sourceMappingURL=SafeERC20__factory.d.ts.map