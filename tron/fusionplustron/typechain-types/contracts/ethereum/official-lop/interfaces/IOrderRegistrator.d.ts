import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, EventFragment, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "../../../../common";
export declare namespace IOrderMixin {
    type OrderStruct = {
        salt: BigNumberish;
        maker: BigNumberish;
        receiver: BigNumberish;
        makerAsset: BigNumberish;
        takerAsset: BigNumberish;
        makingAmount: BigNumberish;
        takingAmount: BigNumberish;
        makerTraits: BigNumberish;
    };
    type OrderStructOutput = [
        salt: bigint,
        maker: bigint,
        receiver: bigint,
        makerAsset: bigint,
        takerAsset: bigint,
        makingAmount: bigint,
        takingAmount: bigint,
        makerTraits: bigint
    ] & {
        salt: bigint;
        maker: bigint;
        receiver: bigint;
        makerAsset: bigint;
        takerAsset: bigint;
        makingAmount: bigint;
        takingAmount: bigint;
        makerTraits: bigint;
    };
}
export interface IOrderRegistratorInterface extends Interface {
    getFunction(nameOrSignature: "registerOrder"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "OrderRegistered"): EventFragment;
    encodeFunctionData(functionFragment: "registerOrder", values: [IOrderMixin.OrderStruct, BytesLike, BytesLike]): string;
    decodeFunctionResult(functionFragment: "registerOrder", data: BytesLike): Result;
}
export declare namespace OrderRegisteredEvent {
    type InputTuple = [
        order: IOrderMixin.OrderStruct,
        extension: BytesLike,
        signature: BytesLike
    ];
    type OutputTuple = [
        order: IOrderMixin.OrderStructOutput,
        extension: string,
        signature: string
    ];
    interface OutputObject {
        order: IOrderMixin.OrderStructOutput;
        extension: string;
        signature: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface IOrderRegistrator extends BaseContract {
    connect(runner?: ContractRunner | null): IOrderRegistrator;
    waitForDeployment(): Promise<this>;
    interface: IOrderRegistratorInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    registerOrder: TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        extension: BytesLike,
        signature: BytesLike
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "registerOrder"): TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        extension: BytesLike,
        signature: BytesLike
    ], [
        void
    ], "nonpayable">;
    getEvent(key: "OrderRegistered"): TypedContractEvent<OrderRegisteredEvent.InputTuple, OrderRegisteredEvent.OutputTuple, OrderRegisteredEvent.OutputObject>;
    filters: {
        "OrderRegistered(tuple,bytes,bytes)": TypedContractEvent<OrderRegisteredEvent.InputTuple, OrderRegisteredEvent.OutputTuple, OrderRegisteredEvent.OutputObject>;
        OrderRegistered: TypedContractEvent<OrderRegisteredEvent.InputTuple, OrderRegisteredEvent.OutputTuple, OrderRegisteredEvent.OutputObject>;
    };
}
//# sourceMappingURL=IOrderRegistrator.d.ts.map