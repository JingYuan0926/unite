import { type ContractRunner } from "ethers";
import type { Escrow, EscrowInterface } from "../../../../contracts/ethereum/official-escrow/Escrow";
export declare class Escrow__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "InvalidCaller";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidImmutables";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidSecret";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidTime";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "NativeTokenSendingFailure";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "SafeTransferFailed";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [];
        readonly name: "EscrowCancelled";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "secret";
            readonly type: "bytes32";
        }];
        readonly name: "EscrowWithdrawal";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly name: "FundsRescued";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "FACTORY";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "PROXY_BYTECODE_HASH";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESCUE_DELAY";
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
            readonly internalType: "address";
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
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
        readonly name: "rescueFunds";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
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
    }];
    static createInterface(): EscrowInterface;
    static connect(address: string, runner?: ContractRunner | null): Escrow;
}
//# sourceMappingURL=Escrow__factory.d.ts.map