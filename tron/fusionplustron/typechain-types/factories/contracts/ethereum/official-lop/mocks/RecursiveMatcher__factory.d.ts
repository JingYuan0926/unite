import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { RecursiveMatcher, RecursiveMatcherInterface } from "../../../../../contracts/ethereum/official-lop/mocks/RecursiveMatcher";
type RecursiveMatcherConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class RecursiveMatcher__factory extends ContractFactory {
    constructor(...args: RecursiveMatcherConstructorParams);
    getDeployTransaction(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<RecursiveMatcher & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): RecursiveMatcher__factory;
    static readonly bytecode = "0x608080604052346100165761060d908161001c8239f35b600080fdfe608080604052600436101561001357600080fd5b60003560e01c908163adf38ba11461017d575063eade14cc1461003557600080fd5b34610165576101c0366003190112610165576004356001600160a01b0381169081900361016557610100366023190112610165576101246101449161016490610184936101a480359067ffffffffffffffff8211610165576060956100a060009336906004016104b0565b8091936101a06040519b8c9a8b998a9763f497df7560e01b895260243560048a015260443560248a015260643560448a015260843560648a015260a43560848a015260c43560a48a015260e43560c48a0152610104803560e48b01528135908a0152813590890152813590880152813590870152850152830152806101c493848401378181018301849052601f01601f191681010301925af180156101715761014557005b606090813d831161016a575b61015b81836104de565b8101031261016557005b600080fd5b503d610151565b6040513d6000823e3d90fd5b346101655736600319016101e081126101655761010013610165576101043567ffffffffffffffff8111610165576101b99036906004016104b0565b5050610144356001600160a01b03811603610165576101c43567ffffffffffffffff8111610165576101ef9036906004016104b0565b9091811561049a578235600160f81b161561043e5750806001116101655760406000198383810103011261016557600182013567ffffffffffffffff811161016557820191818101602084011215610165576021906001840135610252816105ab565b9461026060405196876104de565b81865283602087019260051b820101908584018211610165578401915b81831061041e57505050818101359067ffffffffffffffff82116101655783810160208383010112156101655760018282010135916102bb836105ab565b946102c960405196876104de565b8386526020860191818401868660051b838701010111610165578581850101925b868660051b8387010101841061038f5750505050505050815181510361037d5760005b825181101561037b576000806001600160a01b0361032b84876105c3565b511661033784866105c3565b519082602083519301915af161034b610532565b901561035a575060010161030d565b6040516320508f4560e01b81529081906103779060048301610562565b0390fd5b005b6040516312d3b30360e31b8152600490fd5b833567ffffffffffffffff81116101655783860160408285890101011215610165576103c18882858901010135610516565b906103cf60405192836104de565b8684018101808a0135808452868901910160410111610165578892602092839260009084908790898d018101808301359060410186850137898d010101358301015281520194019390506102ea565b82356001600160a01b03811681036101655781526020928301920161027d565b918160011161016557826104846023826000969560208897019563f497df7560e01b875260018819830191016024840137810186838201520360038101845201826104de565b519082335af1610492610532565b901561035a57005b634e487b7160e01b600052603260045260246000fd5b9181601f840112156101655782359167ffffffffffffffff8311610165576020838186019501011161016557565b90601f8019910116810190811067ffffffffffffffff82111761050057604052565b634e487b7160e01b600052604160045260246000fd5b67ffffffffffffffff811161050057601f01601f191660200190565b3d1561055d573d9061054382610516565b9161055160405193846104de565b82523d6000602084013e565b606090565b6020808252825181830181905290939260005b82811061059757505060409293506000838284010152601f8019910116010190565b818101860151848201604001528501610575565b67ffffffffffffffff81116105005760051b60200190565b805182101561049a5760209160051b01019056fea2646970667358221220edb67e8dc4fdfa33d7d126a92cdbf630c54b0132745823f96371a630a97aa7ed64736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "bytes";
            readonly name: "reason";
            readonly type: "bytes";
        }];
        readonly name: "FailedExternalCall";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "IncorrectCalldataParams";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IOrderMixin";
            readonly name: "orderMixin";
            readonly type: "address";
        }, {
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
            readonly internalType: "bytes32";
            readonly name: "r";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes32";
            readonly name: "vs";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "TakerTraits";
            readonly name: "takerTraits";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "args";
            readonly type: "bytes";
        }];
        readonly name: "matchOrders";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
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
            readonly name: "";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes32";
            readonly name: "";
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
    static createInterface(): RecursiveMatcherInterface;
    static connect(address: string, runner?: ContractRunner | null): RecursiveMatcher;
}
export {};
//# sourceMappingURL=RecursiveMatcher__factory.d.ts.map