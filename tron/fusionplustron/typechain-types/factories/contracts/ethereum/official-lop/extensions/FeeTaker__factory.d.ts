import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, AddressLike, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { FeeTaker, FeeTakerInterface } from "../../../../../contracts/ethereum/official-lop/extensions/FeeTaker";
type FeeTakerConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class FeeTaker__factory extends ContractFactory {
    constructor(...args: FeeTakerConstructorParams);
    getDeployTransaction(limitOrderProtocol: AddressLike, accessToken: AddressLike, weth: AddressLike, owner: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(limitOrderProtocol: AddressLike, accessToken: AddressLike, weth: AddressLike, owner: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<FeeTaker & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): FeeTaker__factory;
    static readonly bytecode = "0x60e03461010657601f61116938819003918201601f19168301916001600160401b0383118484101761010b578084926080946040528339810103126101065761004781610121565b60208201516001600160a01b0392909183831683036101065783610079606061007260408601610121565b9401610121565b1680156100ed57600080546001600160a01b03198116831782556040519616907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a360805260a05260c0526110339081610136823960805181610330015260a05181610437015260c051816106f00152f35b604051631e4fbdf760e01b815260006004820152602490fd5b600080fd5b634e487b7160e01b600052604160045260246000fd5b51906001600160a01b03821682036101065756fe6080604052600436101561001b575b361561001957600080fd5b005b6000803560e01c80631d9671c3146107cc578063462ebde2146102b6578063715018a61461025c57806378e3214f146101915780638da5cb5b1461016a578063d7ff8a801461010d5763f2fde38b14610074575061000e565b3461010a57602036600319011261010a576004356001600160a01b0381811691829003610105576100a3610948565b81156100ec57600054826bffffffffffffffffffffffff60a01b821617600055167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0600080a380f35b604051631e4fbdf760e01b815260048101849052602490fd5b600080fd5b80fd5b503461010a5760206101626101456101376101273661083f565b849394919a98999295979a610a9b565b99945097929b915099610f77565b91620186a0910181016101588184610ddf565b9209151590610ec0565b604051908152f35b503461010a578060031936011261010a57546040516001600160a01b039091168152602090f35b503461010a57604036600319011261010a576004356001600160a01b0381169081810361025857602435916101c4610948565b826101cd578380f35b801590811561023a575b5015610229575080471061021757818080809333611388f16101f7610974565b5015610205575b3880808380f35b60405163b12d13eb60e01b8152600490fd5b604051631e9acf1760e31b8152600490fd5b90610235913390610ee3565b6101fe565b73eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee915014386101d7565b8280fd5b503461010a578060031936011261010a57610275610948565b600080546001600160a01b0319811682556001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a380f35b503461010a5736600319016101e081126107c8576101001361010a576101043567ffffffffffffffff81116107c8576102f3903690600401610811565b909190610144356001600160a01b03811690036107c85767ffffffffffffffff6101c435116107c85761032c366101c435600401610811565b90937f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031633036107b65781156107a2578160151161079e578160291161079e576001600160a01b0360243516916029860190602819810190600160f81b8835811614610768575b50906103ab916101443591610a9b565b959496929193909615806106c3575b6106b157620186a081810180911161069d5761040592916103f66103ef6103e48861040095610ec0565b809361018435610e49565b9384610d66565b9561018435610e49565b610ec0565b918281810311610689579697959688966044356001600160a01b03163003610663576001600160a01b036084358116907f000000000000000000000000000000000000000000000000000000000000000016811480610652575b156105f65750610488938291826105e0575b8282036105c6575b50039061018435030390610f4c565b60138211610494578380f35b61049e82846108be565b60601c91806014116105c257823b156105c257601495610574869261052596604051998a98899788966323175ef160e11b88526004356004890152602435602489015260443560448901526064356064890152608435608489015260a43560a489015260c43560c489015260e43560e48901526101e06101048901526101e4880191610927565b61012480359087015261014480356001600160a01b0316908701526101648035908701526101848035908701526101a4803590870152858103600319016101c487015292601319019101610927565b03925af180156105b75761058b575b818180808380f35b67ffffffffffffffff81116105a35760405238610583565b634e487b7160e01b82526041600452602482fd5b6040513d84823e3d90fd5b8480fd5b6105da90601584840391013560601c610f4c565b38610479565b6105f183600183013560601c610f4c565b610471565b929161061b9481928261063b575b828203610620575b50039061018435030391610ee3565b610488565b61063590601584840391013560601c87610ee3565b3861060c565b61064d83600183013560601c88610ee3565b610604565b5060e435600160f71b16151561045f565b509295505081900301610677578492610488565b60405163679a57eb60e01b8152600490fd5b634e487b7160e01b88526011600452602488fd5b634e487b7160e01b8a52601160045260248afd5b604051630155201f60e01b8152600490fd5b506040516370a0823160e01b81526001600160a01b036101443581166004830152602090829060249082907f0000000000000000000000000000000000000000000000000000000000000000165afa90811561075d578a91610727575b50156103ba565b90506020813d602011610755575b81610742602093836108ef565b81010312610751575138610720565b8980fd5b3d9150610735565b6040513d8c823e3d90fd5b9350505061077d6028198301602987016108be565b60601c9160281981016014116105c257603d860190603c19016103ab61039b565b8380fd5b634e487b7160e01b84526032600452602484fd5b60405163692d508360e11b8152600490fd5b5080fd5b503461010a576020610162610808620186a06107fa6107ea3661083f565b849394919b98999295979b610a9b565b99945097929c915099610c04565b92010190610cc6565b9181601f840112156101055782359167ffffffffffffffff8311610105576020838186019501011161010557565b9060031982016101c0811261010557610100136101055760049167ffffffffffffffff9061010435828111610105578161087b91600401610811565b909390926101243592610144356001600160a01b03811681036101055792610164359261018435926101a435918211610105576108ba91600401610811565b9091565b6bffffffffffffffffffffffff1990358181169392601481106108e057505050565b60140360031b82901b16169150565b90601f8019910116810190811067ffffffffffffffff82111761091157604052565b634e487b7160e01b600052604160045260246000fd5b908060209392818452848401376000828201840152601f01601f1916010190565b6000546001600160a01b0316330361095c57565b60405163118cdaa760e01b8152336004820152602490fd5b3d156109af573d9067ffffffffffffffff821161091157604051916109a3601f8201601f1916602001846108ef565b82523d6000602084013e565b606090565b9291909160009369ffffffffffffffffffff600093169084156107a257803560f81c90600a82600a0296600194888601808711610a4b578210610a475788840186019891829003600019019793849087015b868610610a17575050505050505050565b8385116107c857803560b01c8314610a3b5794870194600919909301928401610a06565b50959950505050505050565b8780fd5b8880fd5b6001600160f01b03199035818116939260028110610a6c57505050565b60020360031b82901b16169150565b8115610a85570490565b634e487b7160e01b600052601260045260246000fd5b91610aa68284610a4f565b60f01c928260021015610b3b57600281013560f81c9260648411610b51578060031161010557610add600219820160038401610a4f565b60f01c928160051015610b3b57600583013560f81c9260648411610b29578260061161010557610b149260051901906006016109b4565b9196909287610b205750565b60649194020492565b604051633066a1f160e01b8152600490fd5b634e487b7160e01b600052603260045260246000fd5b60405163c5374e2d60e01b8152600490fd5b9491610c01999794989693610bce9260e06101c09180358a52602081013560208b0152604081013560408b0152606081013560608b0152608081013560808b015260a081013560a08b015260c081013560c08b0152013560e089015280610100890152870191610927565b6101208501979097526001600160a01b03166101408401526101608301526101808201528084036101a090910152610927565b90565b91979496909594929160148410610caa57610c1f84836108be565b60601c958460141161010557602098601496610c59956040519c8d9b8c9a8b9a631d9671c360e01b8c526013190198019660048b01610b63565b03915afa908115610c9e57600091610c6f575090565b90506020813d602011610c96575b81610c8a602093836108ef565b81010312610105575190565b3d9150610c7d565b6040513d6000823e3d90fd5b9695505050505050610c01925060a060c0830135920135610e49565b620186a0916000198383099280830292838086109503948086039514610d595784831115610d40579082910981600003821680920460028082600302188083028203028083028203028083028203028083028203028083028203028092029003029360018380600003040190848311900302920304170290565b82634e487b71600052156003026011186020526024601cfd5b505090610c019250610a7b565b60001982820982820291828083109203918083039214610dd5578160641115610dc2577f5c28f5c28f5c28f5c28f5c28f5c28f5c28f5c28f5c28f5c28f5c28f5c28f5c29936064910990828211900360fe1b910360021c170290565b634e487b7160005260116020526024601cfd5b5050606491500490565b9060001981830981830291828083109203918083039214610e3d57620186a09082821115610dc2577f58cd20afa2f05a708ede54b48d3ae685db76b3bb83cf2cf95d4e8fb00bcbe61d940990828211900360fb1b910360051c170290565b5050620186a091500490565b90916000198383099280830292838086109503948086039514610d595784831115610d40579082910981600003821680920460028082600302188083028203028083028203028083028203028083028203028083028203028092029003029360018380600003040190848311900302920304170290565b91908201809211610ecd57565b634e487b7160e01b600052601160045260246000fd5b9160446020926000926040519163a9059cbb60e01b83526004830152602482015282855af19081610f29575b5015610f1757565b60405163fb7f507960e01b8152600490fd5b90503d15610f445750600160005114601f3d11165b38610f0f565b3b1515610f3e565b600080809381935af1610f5d610974565b5015610f6557565b604051630db2c7f160e31b8152600490fd5b91979496909594929160148410610fcc57610f9284836108be565b60601c958460141161010557602098601496610c59956040519c8d9b8c9a8b9a6301afff1560e71b8c526013190198019660048b01610b63565b975050505050505060a060c0830135920135610fe9818385610e49565b918115610a8557610c019309151590610ec056fea2646970667358221220328a91651b3b30aeb235b7d2f2a1709543f0b3383a04441deaef79730ec61af164736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "limitOrderProtocol";
            readonly type: "address";
        }, {
            readonly internalType: "contract IERC20";
            readonly name: "accessToken";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "weth";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "owner";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
        readonly inputs: readonly [];
        readonly name: "ETHTransferFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "EthTransferFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InconsistentFee";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InsufficientBalance";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidIntegratorShare";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidWhitelistDiscountNumerator";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "OnlyLimitOrderProtocol";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "OnlyWhitelistOrAccessToken";
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
        readonly inputs: readonly [];
        readonly name: "SafeTransferFailed";
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
            readonly name: "extension";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes32";
            readonly name: "orderHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "taker";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "takingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "remainingMakingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "extraData";
            readonly type: "bytes";
        }];
        readonly name: "getMakingAmount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
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
            readonly name: "order";
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
            readonly name: "taker";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "makingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "remainingMakingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "extraData";
            readonly type: "bytes";
        }];
        readonly name: "getTakingAmount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
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
            readonly name: "extension";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes32";
            readonly name: "orderHash";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "taker";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "makingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "takingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "remainingMakingAmount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "extraData";
            readonly type: "bytes";
        }];
        readonly name: "postInteraction";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "renounceOwnership";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IERC20";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "rescueFunds";
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
    static createInterface(): FeeTakerInterface;
    static connect(address: string, runner?: ContractRunner | null): FeeTaker;
}
export {};
//# sourceMappingURL=FeeTaker__factory.d.ts.map