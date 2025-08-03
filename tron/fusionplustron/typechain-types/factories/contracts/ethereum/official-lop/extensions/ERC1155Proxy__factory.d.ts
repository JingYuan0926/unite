import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, AddressLike, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { ERC1155Proxy, ERC1155ProxyInterface } from "../../../../../contracts/ethereum/official-lop/extensions/ERC1155Proxy";
type ERC1155ProxyConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class ERC1155Proxy__factory extends ContractFactory {
    constructor(...args: ERC1155ProxyConstructorParams);
    getDeployTransaction(_immutableOwner: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(_immutableOwner: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ERC1155Proxy & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): ERC1155Proxy__factory;
    static readonly bytecode = "0x60a03461007057601f6102b338819003918201601f19168301916001600160401b038311848410176100755780849260209460405283398101031261007057516001600160a01b038116810361007057608052604051610227908161008c8239608051818181604e01526101000152f35b600080fd5b634e487b7160e01b600052604160045260246000fdfe60808060405260048036101561001457600080fd5b600091823560e01c91826323b872dd1461008057505063f3d1372f1461003957600080fd5b3461007d578060031936011261007d576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b80fd5b909150346101ed5760c03660031901126101ed576001600160a01b03918135838116908190036101cb57602435908482168092036101e957606435908582168092036101e55760a4359567ffffffffffffffff948588116101e157366023890112156101e15787870135918683116101dd57366024848b0101116101dd577f00000000000000000000000000000000000000000000000000000000000000001633036101cf57509082918894933b156101cb5760c48782879360246040519c8d998a988996637921219560e11b8852870152828601526084356044860152604435606486015260a060848601528260a486015201848401378181018301849052601f01601f191681010301925af180156101c05761019c578380f35b82116101ad57506040523880808380f35b634e487b7160e01b835260419052602482fd5b6040513d86823e3d90fd5b8480fd5b63497131ed60e01b81528690fd5b8980fd5b8880fd5b8680fd5b8580fd5b8280fdfea2646970667358221220f41f7fa95af11681d9353cbf013b7eb2ee5133bb056dd6ebfda90020c59c3c9664736f6c63430008170033";
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
        readonly name: "ERC1155ProxyBadSelector";
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
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "contract IERC1155";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "tokenId";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }];
        readonly name: "func_301JL5R";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): ERC1155ProxyInterface;
    static connect(address: string, runner?: ContractRunner | null): ERC1155Proxy;
}
export {};
//# sourceMappingURL=ERC1155Proxy__factory.d.ts.map