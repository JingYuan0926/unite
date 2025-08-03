import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, EventFragment, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "../../../../common";
export interface SeriesEpochManagerInterface extends Interface {
    getFunction(nameOrSignature: "advanceEpoch" | "epoch" | "epochEquals" | "increaseEpoch"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "EpochIncreased"): EventFragment;
    encodeFunctionData(functionFragment: "advanceEpoch", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "epoch", values: [AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "epochEquals", values: [AddressLike, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "increaseEpoch", values: [BigNumberish]): string;
    decodeFunctionResult(functionFragment: "advanceEpoch", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "epoch", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "epochEquals", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "increaseEpoch", data: BytesLike): Result;
}
export declare namespace EpochIncreasedEvent {
    type InputTuple = [
        maker: AddressLike,
        series: BigNumberish,
        newEpoch: BigNumberish
    ];
    type OutputTuple = [maker: string, series: bigint, newEpoch: bigint];
    interface OutputObject {
        maker: string;
        series: bigint;
        newEpoch: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface SeriesEpochManager extends BaseContract {
    connect(runner?: ContractRunner | null): SeriesEpochManager;
    waitForDeployment(): Promise<this>;
    interface: SeriesEpochManagerInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    advanceEpoch: TypedContractMethod<[
        series: BigNumberish,
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    epoch: TypedContractMethod<[
        maker: AddressLike,
        series: BigNumberish
    ], [
        bigint
    ], "view">;
    epochEquals: TypedContractMethod<[
        maker: AddressLike,
        series: BigNumberish,
        makerEpoch: BigNumberish
    ], [
        boolean
    ], "view">;
    increaseEpoch: TypedContractMethod<[
        series: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "advanceEpoch"): TypedContractMethod<[
        series: BigNumberish,
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "epoch"): TypedContractMethod<[
        maker: AddressLike,
        series: BigNumberish
    ], [
        bigint
    ], "view">;
    getFunction(nameOrSignature: "epochEquals"): TypedContractMethod<[
        maker: AddressLike,
        series: BigNumberish,
        makerEpoch: BigNumberish
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "increaseEpoch"): TypedContractMethod<[series: BigNumberish], [void], "nonpayable">;
    getEvent(key: "EpochIncreased"): TypedContractEvent<EpochIncreasedEvent.InputTuple, EpochIncreasedEvent.OutputTuple, EpochIncreasedEvent.OutputObject>;
    filters: {
        "EpochIncreased(address,uint256,uint256)": TypedContractEvent<EpochIncreasedEvent.InputTuple, EpochIncreasedEvent.OutputTuple, EpochIncreasedEvent.OutputObject>;
        EpochIncreased: TypedContractEvent<EpochIncreasedEvent.InputTuple, EpochIncreasedEvent.OutputTuple, EpochIncreasedEvent.OutputObject>;
    };
}
//# sourceMappingURL=SeriesEpochManager.d.ts.map