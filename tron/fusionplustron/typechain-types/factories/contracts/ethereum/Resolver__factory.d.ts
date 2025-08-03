import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, AddressLike, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type { Resolver, ResolverInterface } from "../../../contracts/ethereum/Resolver";
type ResolverConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class Resolver__factory extends ContractFactory {
    constructor(...args: ResolverConstructorParams);
    getDeployTransaction(factory: AddressLike, lop: AddressLike, initialOwner: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(factory: AddressLike, lop: AddressLike, initialOwner: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<Resolver & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): Resolver__factory;
    static readonly bytecode = "0x60c0346100f757601f610ab338819003918201601f19168301916001600160401b038311848410176100fc578084926060946040528339810103126100f75780516001600160a01b03919082811681036100f75760208201519183831683036100f757604001518381168091036100f75780156100de57600080546001600160a01b03198116831782556040519516907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a360805260a0526109a09081610113823960805181818161024901526105f9015260a051816103910152f35b604051631e4fbdf760e01b815260006004820152602490fd5b600080fd5b634e487b7160e01b600052604160045260246000fdfe60406080815260048036101561001f575b5050361561001d57600080fd5b005b600091823560e01c80631f3177ba1461074b5780632c3c9a371461069657838163318b0562146105d257508063715018a6146105785780638da5cb5b1461055057838163a4fc705a1461048d57508063ca218276146101225763f2fde38b146100885750610010565b3461011e57602036600319011261011e576001600160a01b0382358181169391929084900361011a576100b961093e565b8315610104575050600054826bffffffffffffffffffffffff60a01b821617600055167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0600080a380f35b51631e4fbdf760e01b8152908101849052602490fd5b8480fd5b8280fd5b50366003190191906102a0831261048957610100809312610489578261010319360112610489576102843567ffffffffffffffff928382116104855736602383011215610485578181013594848611610481576024943686888601011161047d5761018b61093e565b84519182019081118282101761046957908493929184528135815260209081810197873589528582019460443586526060998a8401606435815260808501608435815260a086019160a435835260c087019960c4358b528d60e08901954260e01b60018060e01b0360e4351617875260018060a01b039d5199637db5ea3f60e11b8b52518c8b015251908901525160448801525160648701525160848601525160a4850152865160c48501525160e48401528a61010496858589818c7f0000000000000000000000000000000000000000000000000000000000000000165afa94851561045f578295610423575b508180809251875af161028a6108fe565b50156104135792896102da60348b9895858f98966101a09e869d9b988f519788956bffffffffffffffffffffffff19911b16898601520184840137810188838201520360148101845201826108dc565b8851998a9763f497df7560e01b89526101a4948635908a0152610124908135908a0152610144803560448b015261016490813560648c015261018492833560848d0152873560a48d01526101c4988c60c48b359101528c60e46101e43591015261020435908d015261022435908c015261024435908b0152600160fb1b6102643517908a015288015280518093880152845b8381106103f7575050508481018201839052601f01601f1916840184900301918391907f0000000000000000000000000000000000000000000000000000000000000000165af19081156103ee57506103c3578280f35b813d83116103e7575b6103d681836108dc565b810103126103e45738808280f35b80fd5b503d6103cc565b513d85823e3d90fd5b8082018301518b82018601528b98508a97508c9550820161036c565b8751638a0332d560e01b81528590fd5b9094508581813d8311610458575b61043b81836108dc565b8101031261045457518881168103610454579381610279565b5080fd5b503d610431565b8a513d84823e3d90fd5b85604184634e487b7160e01b600052526000fd5b8780fd5b8680fd5b8580fd5b8380fd5b8084843461054c5761012036600319011261054c576104aa61089c565b610100366023190112610547576001600160a01b031691823b1561054757839082519384916390d3252f60e01b83526024359083015260443560248301526064356044830152608435606483015260a435608483015260c43560a483015260e43560c4830152818361010492833560e48401525af190811561053e575061052e5750f35b610537906108b2565b6103e45780f35b513d84823e3d90fd5b505050fd5b5050fd5b838234610454578160031936011261045457905490516001600160a01b039091168152602090f35b83346103e457806003193601126103e45761059161093e565b600080546001600160a01b0319811682556001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a380f35b80848436600319016101208112610547576101001361054c57610104916105f761093e565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031692833b1561011a576101248592845195869384926337a8093960e21b8452803590840152602435602484015260443560448401526064356064840152608435608484015260a43560a484015260c43560c484015260e43560e484015280359083015234905af190811561053e575061052e5750f35b503461011e5761014036600319011261011e57826106b261089c565b610100366043190112610454576001600160a01b031692833b15610454578251938491632330570360e01b83526024359083015260443560248301526064356044830152608435606483015260a435608483015260c43560a483015260e43560c4830152818361010492833560e4840152610124938435908401525af190811561053e575061073f575080f35b610748906108b2565b80f35b5082903461045457806003193601126104545767ffffffffffffffff9083358281116104895761077e9036908601610866565b92906024956024358381116104815761079a9036908301610866565b9290916107a561093e565b83870361085557875b8781106107b9578880f35b600581901b83810135906001600160a01b038216820361083f578683101561084357850135601e198636030181121561083f57850180359088821161083b57602001813603811361083b5791818c809481948d519384928337810182815203925af16108236108fe565b5015610831576001016107ae565b86513d8a823e3d90fd5b8b80fd5b8a80fd5b634e487b7160e01b8b52603284528b8bfd5b85516001621398b960e31b03198152fd5b9181601f840112156108975782359167ffffffffffffffff8311610897576020808501948460051b01011161089757565b600080fd5b600435906001600160a01b038216820361089757565b67ffffffffffffffff81116108c657604052565b634e487b7160e01b600052604160045260246000fd5b90601f8019910116810190811067ffffffffffffffff8211176108c657604052565b3d15610939573d9067ffffffffffffffff82116108c6576040519161092d601f8201601f1916602001846108dc565b82523d6000602084013e565b606090565b6000546001600160a01b0316330361095257565b60405163118cdaa760e01b8152336004820152602490fdfea26469706673582212203129e679970e13071df27ad42aa5aa2d6e80952fe870aeb0ad0c4dbc6a06a7dd64736f6c63430008170033";
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
            readonly internalType: "contract IEscrow";
            readonly name: "escrow";
            readonly type: "address";
        }, {
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
        }];
        readonly name: "cancel";
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
        readonly stateMutability: "payable";
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
        readonly inputs: readonly [{
            readonly internalType: "contract IEscrow";
            readonly name: "escrow";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "secret";
            readonly type: "bytes32";
        }, {
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
        }];
        readonly name: "withdraw";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly stateMutability: "payable";
        readonly type: "receive";
    }];
    static createInterface(): ResolverInterface;
    static connect(address: string, runner?: ContractRunner | null): Resolver;
}
export {};
//# sourceMappingURL=Resolver__factory.d.ts.map