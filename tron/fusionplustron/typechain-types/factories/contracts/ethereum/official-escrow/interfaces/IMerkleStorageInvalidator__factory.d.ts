import { type ContractRunner } from "ethers";
import type { IMerkleStorageInvalidator, IMerkleStorageInvalidatorInterface } from "../../../../../contracts/ethereum/official-escrow/interfaces/IMerkleStorageInvalidator";
export declare class IMerkleStorageInvalidator__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "AccessDenied";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidProof";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "key";
            readonly type: "bytes32";
        }];
        readonly name: "lastValidated";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "index";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "secretHash";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IMerkleStorageInvalidatorInterface;
    static connect(address: string, runner?: ContractRunner | null): IMerkleStorageInvalidator;
}
//# sourceMappingURL=IMerkleStorageInvalidator__factory.d.ts.map