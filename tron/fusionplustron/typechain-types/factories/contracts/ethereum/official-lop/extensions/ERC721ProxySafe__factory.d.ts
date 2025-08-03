import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, AddressLike, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { ERC721ProxySafe, ERC721ProxySafeInterface } from "../../../../../contracts/ethereum/official-lop/extensions/ERC721ProxySafe";
type ERC721ProxySafeConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class ERC721ProxySafe__factory extends ContractFactory {
    constructor(...args: ERC721ProxySafeConstructorParams);
    getDeployTransaction(_immutableOwner: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(_immutableOwner: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ERC721ProxySafe & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): ERC721ProxySafe__factory;
    static readonly bytecode = "0x60a03461006f57601f61024638819003918201601f19168301916001600160401b038311848410176100745780849260209460405283398101031261006f57516001600160a01b038116810361006f576080526040516101bb908161008b8239608051818181604c015260c60152f35b600080fd5b634e487b7160e01b600052604160045260246000fdfe608080604052600436101561001357600080fd5b600090813560e01c90816323b872dd1461007e575063f3d1372f1461003757600080fd5b3461007b578060031936011261007b576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b80fd5b9050346101815760a0366003190112610181576001600160a01b03906004358281169081900361017d57602435918383168093036101795760843593808516809503610175577f00000000000000000000000000000000000000000000000000000000000000001633036101665750908391833b1561016257606490836040519586948593632142170760e11b855260048501526024840152833560448401525af180156101575761012e575080f35b67ffffffffffffffff81116101435760405280f35b634e487b7160e01b82526041600452602482fd5b6040513d84823e3d90fd5b8280fd5b63497131ed60e01b8152600490fd5b8580fd5b8480fd5b8380fd5b5080fdfea2646970667358221220bbdd24ee5d0f56ee3a185a018833fab51c220921f303d7028306b0f16986883a64736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_immutableOwner";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
        readonly inputs: readonly [];
        readonly name: "ERC721ProxySafeBadSelector";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "IOAccessDenied";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "IMMUTABLE_OWNER";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "from";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "tokenId";
            readonly type: "uint256";
        }, {
            readonly internalType: "contract IERC721";
            readonly name: "token";
            readonly type: "address";
        }];
        readonly name: "func_60iHVgK";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): ERC721ProxySafeInterface;
    static connect(address: string, runner?: ContractRunner | null): ERC721ProxySafe;
}
export {};
//# sourceMappingURL=ERC721ProxySafe__factory.d.ts.map