import { type ContractRunner } from "ethers";
import type { EthReceiver, EthReceiverInterface } from "../../../../../@1inch/solidity-utils/contracts/mixins/EthReceiver";
export declare class EthReceiver__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "EthDepositRejected";
        readonly type: "error";
    }, {
        readonly stateMutability: "payable";
        readonly type: "receive";
    }];
    static createInterface(): EthReceiverInterface;
    static connect(address: string, runner?: ContractRunner | null): EthReceiver;
}
//# sourceMappingURL=EthReceiver__factory.d.ts.map