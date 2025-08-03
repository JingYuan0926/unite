import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, AddressLike, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type { MerkleStorageInvalidator, MerkleStorageInvalidatorInterface } from "../../../../contracts/ethereum/official-escrow/MerkleStorageInvalidator";
type MerkleStorageInvalidatorConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class MerkleStorageInvalidator__factory extends ContractFactory {
    constructor(...args: MerkleStorageInvalidatorConstructorParams);
    getDeployTransaction(limitOrderProtocol: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(limitOrderProtocol: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<MerkleStorageInvalidator & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): MerkleStorageInvalidator__factory;
    static readonly bytecode = "0x60a03461006957601f61041438819003918201601f19168301916001600160401b0383118484101761006e5780849260209460405283398101031261006957516001600160a01b03811681036100695760805260405161038f908161008582396080518160aa0152f35b600080fd5b634e487b7160e01b600052604160045260246000fdfe60806040908082526004918236101561001757600080fd5b600091823560e01c908163acf4ce5c14610278575063adf38ba11461003b57600080fd5b346102705736600319016101e0811261027457610100136102705767ffffffffffffffff906101043582811161026c5761007890369086016102a9565b6001600160a01b0392916101443584811603610268576101c435858111610264576100a690369089016102a9565b50937f000000000000000000000000000000000000000000000000000000000000000016330361025457906100da9161030e565b825161012435602080830191825292909301609f190135601081901b61ffff191682860152603e82526001600160f01b0395929390929161011a816102dc565b519020918135601e19833603018112156102505782019586359188831161024c576005928060051b3603878a0113610248578a9088888701359601359989518981019067ffffffffffffffff60c01b8960c01b1682528c602882015260288152610183816102dc565b519020958a845b84861061021157505050505050811691160361020157600181018091116101ee57835195868501908111878210176101db578452855281850193845285528490528320915182555160019091015580f35b634e487b7160e01b885260418952602488fd5b634e487b7160e01b875260118852602487fd5b83516309bde33960e01b81528890fd5b85988c849596976001951b870101359081811060001461023d5782528c52205b96019291908a8e61018a565b9082528c5220610231565b8a80fd5b8980fd5b8880fd5b8251634ca8886760e01b81528790fd5b8680fd5b8580fd5b8380fd5b5080fd5b8280fd5b9050828434610270576020366003190112610270579083913581528060205220600181549101549082526020820152f35b9181601f840112156102d75782359167ffffffffffffffff83116102d757602083818601950101116102d757565b600080fd5b6060810190811067ffffffffffffffff8211176102f857604052565b634e487b7160e01b600052604160045260246000fd5b919091602083106103505780359063ffffffff8260c01c169160e01c93601f1901841161033f578101602001920390565b6309605a0160e41b60005260046000fd5b5060009150819056fea2646970667358221220613f691ec8e34fc36bb71606a2a1b0c64348bdf32570e845ef93058d70064a9164736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "limitOrderProtocol";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
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
            readonly name: "leaf";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "salt";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "maker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "receiver";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "makerAsset";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "takerAsset";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "makingAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "takingAmount";
                readonly type: "uint256";
            }, {
                readonly internalType: "MakerTraits";
                readonly name: "makerTraits";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IOrderMixin.Order";
            readonly name: "";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes";
            readonly name: "extension";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes32";
            readonly name: "orderHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "extraData";
            readonly type: "bytes";
        }];
        readonly name: "takerInteraction";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): MerkleStorageInvalidatorInterface;
    static connect(address: string, runner?: ContractRunner | null): MerkleStorageInvalidator;
}
export {};
//# sourceMappingURL=MerkleStorageInvalidator__factory.d.ts.map