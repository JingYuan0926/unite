import { type ContractRunner } from "ethers";
import type { PermitAndCall, PermitAndCallInterface } from "../../../../../@1inch/solidity-utils/contracts/mixins/PermitAndCall";
export declare class PermitAndCall__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "bytes";
            readonly name: "permit";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "action";
            readonly type: "bytes";
        }];
        readonly name: "permitAndCall";
        readonly outputs: readonly [];
        readonly stateMutability: "payable";
        readonly type: "function";
    }];
    static createInterface(): PermitAndCallInterface;
    static connect(address: string, runner?: ContractRunner | null): PermitAndCall;
}
//# sourceMappingURL=PermitAndCall__factory.d.ts.map