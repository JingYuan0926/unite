import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, AddressLike, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { OrderIdInvalidator, OrderIdInvalidatorInterface } from "../../../../../contracts/ethereum/official-lop/extensions/OrderIdInvalidator";
type OrderIdInvalidatorConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class OrderIdInvalidator__factory extends ContractFactory {
    constructor(...args: OrderIdInvalidatorConstructorParams);
    getDeployTransaction(limitOrderProtocol_: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(limitOrderProtocol_: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<OrderIdInvalidator & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): OrderIdInvalidator__factory;
    static readonly bytecode = "0x60a03461006957601f61025f38819003918201601f19168301916001600160401b0383118484101761006e5780849260209460405283398101031261006957516001600160a01b0381168103610069576080526040516101da908161008582396080518160a30152f35b600080fd5b634e487b7160e01b600052604160045260246000fdfe60806040908082526004918236101561001757600080fd5b600092833560e01c630986bdd51461002e57600080fd5b346101695736600319016101e0811261016d57610100136101695767ffffffffffffffff90610104358281116101655761006b9036908301610171565b505061012435936001600160a01b03926101443584811603610161576101c4359081116101615761009f9036908401610171565b91847f000000000000000000000000000000000000000000000000000000000000000016330361015357506001600160e01b03199190358281169184811061013f575b5050905060e01c9160243516908186528560205283862083875260205283862054801560001461012357505084528360205281842090845260205282205580f35b91509391500361013257505080f35b5163561a411d60e11b8152fd5b83919250840360031b1b16168038806100e2565b634ca8886760e01b81528390fd5b8680fd5b8580fd5b8380fd5b8480fd5b9181601f8401121561019f5782359167ffffffffffffffff831161019f576020838186019501011161019f57565b600080fdfea26469706673582212207a607606bfae2d42f58c86726398ed396df72c27cdafa282b7e590816055513b64736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "limitOrderProtocol_";
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
        readonly name: "InvalidOrderHash";
        readonly type: "error";
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
            readonly name: "order";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes";
            readonly name: "";
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
        readonly name: "preInteraction";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): OrderIdInvalidatorInterface;
    static connect(address: string, runner?: ContractRunner | null): OrderIdInvalidator;
}
export {};
//# sourceMappingURL=OrderIdInvalidator__factory.d.ts.map