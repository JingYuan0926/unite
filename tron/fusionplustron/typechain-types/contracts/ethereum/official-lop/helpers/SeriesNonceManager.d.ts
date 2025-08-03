import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, EventFragment, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "../../../../common";
export interface SeriesNonceManagerInterface extends Interface {
    getFunction(nameOrSignature: "advanceNonce" | "increaseNonce" | "nonce" | "nonceEquals" | "timestampBelow" | "timestampBelowAndNonceEquals"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "NonceIncreased"): EventFragment;
    encodeFunctionData(functionFragment: "advanceNonce", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "increaseNonce", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "nonce", values: [BigNumberish, AddressLike]): string;
    encodeFunctionData(functionFragment: "nonceEquals", values: [BigNumberish, AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "timestampBelow", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "timestampBelowAndNonceEquals", values: [BigNumberish]): string;
    decodeFunctionResult(functionFragment: "advanceNonce", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "increaseNonce", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "nonce", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "nonceEquals", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "timestampBelow", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "timestampBelowAndNonceEquals", data: BytesLike): Result;
}
export declare namespace NonceIncreasedEvent {
    type InputTuple = [
        maker: AddressLike,
        series: BigNumberish,
        newNonce: BigNumberish
    ];
    type OutputTuple = [maker: string, series: bigint, newNonce: bigint];
    interface OutputObject {
        maker: string;
        series: bigint;
        newNonce: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface SeriesNonceManager extends BaseContract {
    connect(runner?: ContractRunner | null): SeriesNonceManager;
    waitForDeployment(): Promise<this>;
    interface: SeriesNonceManagerInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    advanceNonce: TypedContractMethod<[
        series: BigNumberish,
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    increaseNonce: TypedContractMethod<[
        series: BigNumberish
    ], [
        void
    ], "nonpayable">;
    nonce: TypedContractMethod<[
        series: BigNumberish,
        maker: AddressLike
    ], [
        bigint
    ], "view">;
    nonceEquals: TypedContractMethod<[
        series: BigNumberish,
        makerAddress: AddressLike,
        makerNonce: BigNumberish
    ], [
        boolean
    ], "view">;
    timestampBelow: TypedContractMethod<[time: BigNumberish], [boolean], "view">;
    timestampBelowAndNonceEquals: TypedContractMethod<[
        timeNonceSeriesAccount: BigNumberish
    ], [
        boolean
    ], "view">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "advanceNonce"): TypedContractMethod<[
        series: BigNumberish,
        amount: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "increaseNonce"): TypedContractMethod<[series: BigNumberish], [void], "nonpayable">;
    getFunction(nameOrSignature: "nonce"): TypedContractMethod<[
        series: BigNumberish,
        maker: AddressLike
    ], [
        bigint
    ], "view">;
    getFunction(nameOrSignature: "nonceEquals"): TypedContractMethod<[
        series: BigNumberish,
        makerAddress: AddressLike,
        makerNonce: BigNumberish
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "timestampBelow"): TypedContractMethod<[time: BigNumberish], [boolean], "view">;
    getFunction(nameOrSignature: "timestampBelowAndNonceEquals"): TypedContractMethod<[
        timeNonceSeriesAccount: BigNumberish
    ], [
        boolean
    ], "view">;
    getEvent(key: "NonceIncreased"): TypedContractEvent<NonceIncreasedEvent.InputTuple, NonceIncreasedEvent.OutputTuple, NonceIncreasedEvent.OutputObject>;
    filters: {
        "NonceIncreased(address,uint256,uint256)": TypedContractEvent<NonceIncreasedEvent.InputTuple, NonceIncreasedEvent.OutputTuple, NonceIncreasedEvent.OutputObject>;
        NonceIncreased: TypedContractEvent<NonceIncreasedEvent.InputTuple, NonceIncreasedEvent.OutputTuple, NonceIncreasedEvent.OutputObject>;
    };
}
//# sourceMappingURL=SeriesNonceManager.d.ts.map