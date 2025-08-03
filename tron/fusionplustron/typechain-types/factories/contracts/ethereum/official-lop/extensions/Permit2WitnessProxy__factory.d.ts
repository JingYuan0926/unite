import { ContractFactory, ContractTransactionResponse } from "ethers";
import type { Signer, AddressLike, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../../common";
import type { Permit2WitnessProxy, Permit2WitnessProxyInterface } from "../../../../../contracts/ethereum/official-lop/extensions/Permit2WitnessProxy";
type Permit2WitnessProxyConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class Permit2WitnessProxy__factory extends ContractFactory {
    constructor(...args: Permit2WitnessProxyConstructorParams);
    getDeployTransaction(_immutableOwner: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<ContractDeployTransaction>;
    deploy(_immutableOwner: AddressLike, overrides?: NonPayableOverrides & {
        from?: string;
    }): Promise<Permit2WitnessProxy & {
        deploymentTransaction(): ContractTransactionResponse;
    }>;
    connect(runner: ContractRunner | null): Permit2WitnessProxy__factory;
    static readonly bytecode = "0x60a03461007057601f61046038819003918201601f19168301916001600160401b038311848410176100755780849260209460405283398101031261007057516001600160a01b0381168103610070576080526040516103d4908161008c8239608051818181604c01526101100152f35b600080fd5b634e487b7160e01b600052604160045260246000fdfe608080604052600436101561001357600080fd5b600090813560e01c90816323b872dd1461007e575063f3d1372f1461003757600080fd5b3461007b578060031936011261007b576040517f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03168152602090f35b80fd5b90503461039a5761012036600319011261039a57600435906001600160a01b0382168203610396576024356001600160a01b0381169290839003610392576080366063190112610392576101049167ffffffffffffffff83351161036b57366023843501121561036b5767ffffffffffffffff8335600401351161036b57366024843560040135853501011161036b577f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031633036103835750604051926040840184811067ffffffffffffffff82111761036f5760405283526044356020840152604051906080820182811067ffffffffffffffff82111761036f57604052605382527f5769746e657373207769746e65737329546f6b656e5065726d697373696f6e7360208301527f286164647265737320746f6b656e2c75696e7432353620616d6f756e74295769604083015272746e65737328627974657333322073616c742960681b60608301526e22d473030f116ddee9f6b43ac78ba33b1561036b576040516309be14ff60e11b815293606435906001600160a01b03821682036103675791602087959387959360018060a01b03166004870152608435602487015260a435604487015260c435606487015260018060a01b038151166084870152015160a485015260018060a01b031660c484015260e43560e48401526101408284015280519081610144850152845b82811061034b5750508290601f6101649186838286010152811991829101168301916101608484030161012485015284356004013590830152601f6101849480356004013560248235018786013735600401358381018601889052011601030181836e22d473030f116ddee9f6b43ac78ba35af1801561034057610317575080f35b67ffffffffffffffff811161032c5760405280f35b634e487b7160e01b82526041600452602482fd5b6040513d84823e3d90fd5b6020818301810151610164898401015288965087955001610295565b8680fd5b8480fd5b634e487b7160e01b86526041600452602486fd5b63497131ed60e01b8152600490fd5b8380fd5b8280fd5b5080fdfea26469706673582212204f645f6bc285c29934b06cb8669220d9f71d4c8ae702fa9c15c23a0da95ffaae64736f6c63430008170033";
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
        readonly name: "IOAccessDenied";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "Permit2WitnessProxyBadSelector";
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
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "address";
                    readonly name: "token";
                    readonly type: "address";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly internalType: "struct IPermit2WitnessTransferFrom.TokenPermissions";
                readonly name: "permitted";
                readonly type: "tuple";
            }, {
                readonly internalType: "uint256";
                readonly name: "nonce";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "deadline";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IPermit2WitnessTransferFrom.PermitTransferFrom";
            readonly name: "permit";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes32";
            readonly name: "witness";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "sig";
            readonly type: "bytes";
        }];
        readonly name: "func_801zDya";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): Permit2WitnessProxyInterface;
    static connect(address: string, runner?: ContractRunner | null): Permit2WitnessProxy;
}
export {};
//# sourceMappingURL=Permit2WitnessProxy__factory.d.ts.map