import { type ContractRunner } from "ethers";
import type { OnlyWethReceiver, OnlyWethReceiverInterface } from "../../../../../@1inch/solidity-utils/contracts/mixins/OnlyWethReceiver";
export declare class OnlyWethReceiver__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "EthDepositRejected";
        readonly type: "error";
    }, {
        readonly stateMutability: "payable";
        readonly type: "receive";
    }];
    static createInterface(): OnlyWethReceiverInterface;
    static connect(address: string, runner?: ContractRunner | null): OnlyWethReceiver;
}
//# sourceMappingURL=OnlyWethReceiver__factory.d.ts.map