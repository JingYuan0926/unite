import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, AddressLike, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { ResolverExample, ResolverExampleInterface } from "../../../../../contracts/ethereum/official-escrow/mocks/ResolverExample";
type ResolverExampleConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class ResolverExample__factory extends ContractFactory {
    constructor(...args: ResolverExampleConstructorParams);
    getDeployTransaction(factory: AddressLike, lop: AddressLike, initialOwner: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(factory: AddressLike, lop: AddressLike, initialOwner: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ResolverExample & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): ResolverExample__factory;
    static readonly bytecode = "0x60c0346100f757601f61092d38819003918201601f19168301916001600160401b038311848410176100fc578084926060946040528339810103126100f75780516001600160a01b03919082811681036100f75760208201519183831683036100f757604001518381168091036100f75780156100de57600080546001600160a01b03198116831782556040519516907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a360805260a05261081a90816101138239608051818181610234015261051f015260a0518161037c0152f35b604051631e4fbdf760e01b815260006004820152602490fd5b600080fd5b634e487b7160e01b600052604160045260246000fdfe60406080815260048036101561001f575b5050361561001d57600080fd5b005b600091823560e01c80631f3177ba146105ef578063318b0562146104fa578063715018a6146104a05780638da5cb5b14610478578063ca218276146101085763f2fde38b1461006e5750610010565b34610104576020366003190112610104576001600160a01b038235818116939192908490036101005761009f6107b8565b83156100ea575050600054826bffffffffffffffffffffffff60a01b821617600055167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0600080a380f35b51631e4fbdf760e01b8152908101849052602490fd5b8480fd5b8280fd5b509034610104573660031901916102a0831261047457610100809312610474578261010319360112610474576102843567ffffffffffffffff92838211610470573660238301121561047057818101359484861161046c5760249436868886010111610468576101766107b8565b84519182019081118282101761045457908493929184528135815260209081810197873589528582019460443586526060998a8401606435815260808501608435815260a086019160a435835260c087019960c4358b528d60e08901954260e01b60018060e01b0360e4351617875260018060a01b039d5199637db5ea3f60e11b8b52518c8b015251908901525160448801525160648701525160848601525160a4850152865160c48501525160e48401528a61010496858589818c7f0000000000000000000000000000000000000000000000000000000000000000165afa94851561044a57829561040e575b508180809251875af1610275610778565b50156103fe5792896102c560348b9895858f98966101a09e869d9b988f519788956bffffffffffffffffffffffff19911b1689860152018484013781018883820152036014810184520182610740565b8851998a9763f497df7560e01b89526101a4948635908a0152610124908135908a0152610144803560448b015261016490813560648c015261018492833560848d0152873560a48d01526101c4988c60c48b359101528c60e46101e43591015261020435908d015261022435908c015261024435908b0152600160fb1b6102643517908a015288015280518093880152845b8381106103e2575050508481018201839052601f01601f1916840184900301918391907f0000000000000000000000000000000000000000000000000000000000000000165af19081156103d957506103ae578280f35b813d83116103d2575b6103c18183610740565b810103126103cf5738808280f35b80fd5b503d6103b7565b513d85823e3d90fd5b8082018301518b82018601528b98508a97508c95508201610357565b8751638a0332d560e01b81528590fd5b9094508581813d8311610443575b6104268183610740565b8101031261043f5751888116810361043f579381610264565b5080fd5b503d61041c565b8a513d84823e3d90fd5b85604184634e487b7160e01b600052526000fd5b8780fd5b8680fd5b8580fd5b8380fd5b83823461043f578160031936011261043f57905490516001600160a01b039091168152602090f35b83346103cf57806003193601126103cf576104b96107b8565b600080546001600160a01b0319811682556001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a380f35b50366003190161012081126104745761010013610104576101049161051d6107b8565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316928490843b1561043f576101248451809681936337a8093960e21b8352863587840152602435602484015260443560448401526064356064840152608435608484015260a43560a484015260c43560c484015260e43560e484015280359083015234905af180156105e5576105ba578380f35b67ffffffffffffffff83116105d25750523880808380f35b634e487b7160e01b845260419052602483fd5b82513d86823e3d90fd5b5082903461043f578060031936011261043f5767ffffffffffffffff90833582811161047457610622903690860161070a565b929060249560243583811161046c5761063e903690830161070a565b9290916106496107b8565b8387036106f957875b87811061065d578880f35b600581901b83810135906001600160a01b03821682036106e357868310156106e757850135601e19863603018112156106e35785018035908882116106df5760200181360381136106df5791818c809481948d519384928337810182815203925af16106c7610778565b50156106d557600101610652565b86513d8a823e3d90fd5b8b80fd5b8a80fd5b634e487b7160e01b8b52603284528b8bfd5b85516001621398b960e31b03198152fd5b9181601f8401121561073b5782359167ffffffffffffffff831161073b576020808501948460051b01011161073b57565b600080fd5b90601f8019910116810190811067ffffffffffffffff82111761076257604052565b634e487b7160e01b600052604160045260246000fd5b3d156107b3573d9067ffffffffffffffff821161076257604051916107a7601f8201601f191660200184610740565b82523d6000602084013e565b606090565b6000546001600160a01b031633036107cc57565b60405163118cdaa760e01b8152336004820152602490fdfea26469706673582212208619a31326b405e526e64d8ecea232950a3fb1cec4f84ea7add1fef47d0a870d64736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "contract IEscrowFactory";
            readonly name: "factory";
            readonly type: "address";
        }, {
            readonly internalType: "contract IOrderMixin";
            readonly name: "lop";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "initialOwner";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidLength";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "LengthMismatch";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "NativeTokenSendingFailure";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "owner";
            readonly type: "address";
        }];
        readonly name: "OwnableInvalidOwner";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "OwnableUnauthorizedAccount";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "previousOwner";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "newOwner";
            readonly type: "address";
        }];
        readonly name: "OwnershipTransferred";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "targets";
            readonly type: "address[]";
        }, {
            readonly internalType: "bytes[]";
            readonly name: "arguments";
            readonly type: "bytes[]";
        }];
        readonly name: "arbitraryCalls";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "orderHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes32";
                readonly name: "hashlock";
                readonly type: "bytes32";
            }, {
                readonly internalType: "Address";
                readonly name: "maker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "taker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "token";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "safetyDeposit";
                readonly type: "uint256";
            }, {
                readonly internalType: "Timelocks";
                readonly name: "timelocks";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBaseEscrow.Immutables";
            readonly name: "dstImmutables";
            readonly type: "tuple";
        }, {
            readonly internalType: "uint256";
            readonly name: "srcCancellationTimestamp";
            readonly type: "uint256";
        }];
        readonly name: "deployDst";
        readonly outputs: readonly [];
        readonly stateMutability: "payable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "orderHash";
                readonly type: "bytes32";
            }, {
                readonly internalType: "bytes32";
                readonly name: "hashlock";
                readonly type: "bytes32";
            }, {
                readonly internalType: "Address";
                readonly name: "maker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "taker";
                readonly type: "uint256";
            }, {
                readonly internalType: "Address";
                readonly name: "token";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "safetyDeposit";
                readonly type: "uint256";
            }, {
                readonly internalType: "Timelocks";
                readonly name: "timelocks";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBaseEscrow.Immutables";
            readonly name: "immutables";
            readonly type: "tuple";
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
        readonly name: "deploySrc";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "owner";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "renounceOwnership";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "newOwner";
            readonly type: "address";
        }];
        readonly name: "transferOwnership";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly stateMutability: "payable";
        readonly type: "receive";
    }];
    static createInterface(): ResolverExampleInterface;
    static connect(address: string, runner?: ContractRunner | null): ResolverExample;
}
export {};
//# sourceMappingURL=ResolverExample__factory.d.ts.map