import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, AddressLike, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { TakerContract, TakerContractInterface } from "../../../../../contracts/ethereum/official-lop/mocks/TakerContract";
type TakerContractConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class TakerContract__factory extends ContractFactory {
    constructor(...args: TakerContractConstructorParams);
    getDeployTransaction(swap: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(swap: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<TakerContract & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): TakerContract__factory;
    static readonly bytecode = "0x60a03461006957601f61021438819003918201601f19168301916001600160401b0383118484101761006e5780849260209460405283398101031261006957516001600160a01b03811681036100695760805260405161018f908161008582396080518160c10152f35b600080fd5b634e487b7160e01b600052604160045260246000fdfe608080604052600436101561001357600080fd5b600090813560e01c639fda64bd1461002a57600080fd5b366003190161018081126101555761010013610151576101046101246101449061016492639fda64bd60e01b85526004356004860152602435602486015260443560448601526064356064860152608435608486015260a43560a486015260c43560c486015260e43560e4860152803590850152803590840152803590830152803590820152606081610184813460018060a01b037f0000000000000000000000000000000000000000000000000000000000000000165af18015610146576100f1575080f35b60603d60601161013f575b601f19601f820116820167ffffffffffffffff83821091111761012b5790606091810103126101285780f35b80fd5b634e487b7160e01b83526041600452602483fd5b503d6100fc565b6040513d84823e3d90fd5b5080fd5b8280fdfea2646970667358221220d76a21d8215ea0f38a12f107f262b0eb565c56cccb906fdaee0c5960ed78a1f264736f6c63430008170033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "contract IOrderMixin";
            readonly name: "swap";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
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
        }];
        readonly name: "fillOrder";
        readonly outputs: readonly [];
        readonly stateMutability: "payable";
        readonly type: "function";
    }];
    static createInterface(): TakerContractInterface;
    static connect(address: string, runner?: ContractRunner | null): TakerContract;
}
export {};
//# sourceMappingURL=TakerContract__factory.d.ts.map