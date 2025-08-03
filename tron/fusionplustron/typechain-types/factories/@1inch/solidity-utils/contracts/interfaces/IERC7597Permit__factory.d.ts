import { type ContractRunner } from "ethers";
import type { IERC7597Permit, IERC7597PermitInterface } from "../../../../../@1inch/solidity-utils/contracts/interfaces/IERC7597Permit";
export declare class IERC7597Permit__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "owner";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "spender";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "value";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "deadline";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly name: "permit";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IERC7597PermitInterface;
    static connect(address: string, runner?: ContractRunner | null): IERC7597Permit;
}
//# sourceMappingURL=IERC7597Permit__factory.d.ts.map