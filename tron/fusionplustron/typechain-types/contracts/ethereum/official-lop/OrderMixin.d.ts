import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, EventFragment, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "../../../common";
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
export interface OrderMixinInterface extends Interface {
    getFunction(nameOrSignature: "advanceEpoch" | "and" | "arbitraryStaticCall" | "bitInvalidatorForOrder" | "bitsInvalidateForOrder" | "cancelOrder" | "cancelOrders" | "checkPredicate" | "eip712Domain" | "epoch" | "epochEquals" | "eq" | "fillContractOrder" | "fillContractOrderArgs" | "fillOrder" | "fillOrderArgs" | "gt" | "hashOrder" | "increaseEpoch" | "lt" | "not" | "or" | "paused" | "permitAndCall" | "rawRemainingInvalidatorForOrder" | "remainingInvalidatorForOrder" | "simulate"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "BitInvalidatorUpdated" | "EIP712DomainChanged" | "EpochIncreased" | "OrderCancelled" | "OrderFilled" | "Paused" | "Unpaused"): EventFragment;
    encodeFunctionData(functionFragment: "advanceEpoch", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "and", values: [BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "arbitraryStaticCall", values: [AddressLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "bitInvalidatorForOrder", values: [AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "bitsInvalidateForOrder", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "cancelOrder", values: [BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "cancelOrders", values: [BigNumberish[], BytesLike[]]): string;
    encodeFunctionData(functionFragment: "checkPredicate", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "eip712Domain", values?: undefined): string;
    encodeFunctionData(functionFragment: "epoch", values: [AddressLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "epochEquals", values: [AddressLike, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "eq", values: [BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "fillContractOrder", values: [IOrderMixin.OrderStruct, BytesLike, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "fillContractOrderArgs", values: [
        IOrderMixin.OrderStruct,
        BytesLike,
        BigNumberish,
        BigNumberish,
        BytesLike
    ]): string;
    encodeFunctionData(functionFragment: "fillOrder", values: [
        IOrderMixin.OrderStruct,
        BytesLike,
        BytesLike,
        BigNumberish,
        BigNumberish
    ]): string;
    encodeFunctionData(functionFragment: "fillOrderArgs", values: [
        IOrderMixin.OrderStruct,
        BytesLike,
        BytesLike,
        BigNumberish,
        BigNumberish,
        BytesLike
    ]): string;
    encodeFunctionData(functionFragment: "gt", values: [BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "hashOrder", values: [IOrderMixin.OrderStruct]): string;
    encodeFunctionData(functionFragment: "increaseEpoch", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "lt", values: [BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "not", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "or", values: [BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "paused", values?: undefined): string;
    encodeFunctionData(functionFragment: "permitAndCall", values: [BytesLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "rawRemainingInvalidatorForOrder", values: [AddressLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "remainingInvalidatorForOrder", values: [AddressLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "simulate", values: [AddressLike, BytesLike]): string;
    decodeFunctionResult(functionFragment: "advanceEpoch", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "and", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "arbitraryStaticCall", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "bitInvalidatorForOrder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "bitsInvalidateForOrder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "cancelOrder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "cancelOrders", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "checkPredicate", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "eip712Domain", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "epoch", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "epochEquals", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "eq", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "fillContractOrder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "fillContractOrderArgs", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "fillOrder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "fillOrderArgs", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "gt", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "hashOrder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "increaseEpoch", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "lt", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "not", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "or", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "permitAndCall", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rawRemainingInvalidatorForOrder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "remainingInvalidatorForOrder", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "simulate", data: BytesLike): Result;
}
export declare namespace BitInvalidatorUpdatedEvent {
    type InputTuple = [
        maker: AddressLike,
        slotIndex: BigNumberish,
        slotValue: BigNumberish
    ];
    type OutputTuple = [
        maker: string,
        slotIndex: bigint,
        slotValue: bigint
    ];
    interface OutputObject {
        maker: string;
        slotIndex: bigint;
        slotValue: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace EIP712DomainChangedEvent {
    type InputTuple = [];
    type OutputTuple = [];
    interface OutputObject {
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
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
export declare namespace OrderCancelledEvent {
    type InputTuple = [orderHash: BytesLike];
    type OutputTuple = [orderHash: string];
    interface OutputObject {
        orderHash: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace OrderFilledEvent {
    type InputTuple = [
        orderHash: BytesLike,
        remainingAmount: BigNumberish
    ];
    type OutputTuple = [orderHash: string, remainingAmount: bigint];
    interface OutputObject {
        orderHash: string;
        remainingAmount: bigint;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace PausedEvent {
    type InputTuple = [account: AddressLike];
    type OutputTuple = [account: string];
    interface OutputObject {
        account: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace UnpausedEvent {
    type InputTuple = [account: AddressLike];
    type OutputTuple = [account: string];
    interface OutputObject {
        account: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface OrderMixin extends BaseContract {
    connect(runner?: ContractRunner | null): OrderMixin;
    waitForDeployment(): Promise<this>;
    interface: OrderMixinInterface;
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
    and: TypedContractMethod<[
        offsets: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    arbitraryStaticCall: TypedContractMethod<[
        target: AddressLike,
        data: BytesLike
    ], [
        bigint
    ], "view">;
    bitInvalidatorForOrder: TypedContractMethod<[
        maker: AddressLike,
        slot: BigNumberish
    ], [
        bigint
    ], "view">;
    bitsInvalidateForOrder: TypedContractMethod<[
        makerTraits: BigNumberish,
        additionalMask: BigNumberish
    ], [
        void
    ], "nonpayable">;
    cancelOrder: TypedContractMethod<[
        makerTraits: BigNumberish,
        orderHash: BytesLike
    ], [
        void
    ], "nonpayable">;
    cancelOrders: TypedContractMethod<[
        makerTraits: BigNumberish[],
        orderHashes: BytesLike[]
    ], [
        void
    ], "nonpayable">;
    checkPredicate: TypedContractMethod<[
        predicate: BytesLike
    ], [
        boolean
    ], "view">;
    eip712Domain: TypedContractMethod<[
    ], [
        [
            string,
            string,
            string,
            bigint,
            string,
            string,
            bigint[]
        ] & {
            fields: string;
            name: string;
            version: string;
            chainId: bigint;
            verifyingContract: string;
            salt: string;
            extensions: bigint[];
        }
    ], "view">;
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
    eq: TypedContractMethod<[
        value: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    fillContractOrder: TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        signature: BytesLike,
        amount: BigNumberish,
        takerTraits: BigNumberish
    ], [
        [bigint, bigint, string]
    ], "nonpayable">;
    fillContractOrderArgs: TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        signature: BytesLike,
        amount: BigNumberish,
        takerTraits: BigNumberish,
        args: BytesLike
    ], [
        [bigint, bigint, string]
    ], "nonpayable">;
    fillOrder: TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        r: BytesLike,
        vs: BytesLike,
        amount: BigNumberish,
        takerTraits: BigNumberish
    ], [
        [bigint, bigint, string]
    ], "payable">;
    fillOrderArgs: TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        r: BytesLike,
        vs: BytesLike,
        amount: BigNumberish,
        takerTraits: BigNumberish,
        args: BytesLike
    ], [
        [bigint, bigint, string]
    ], "payable">;
    gt: TypedContractMethod<[
        value: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    hashOrder: TypedContractMethod<[
        order: IOrderMixin.OrderStruct
    ], [
        string
    ], "view">;
    increaseEpoch: TypedContractMethod<[
        series: BigNumberish
    ], [
        void
    ], "nonpayable">;
    lt: TypedContractMethod<[
        value: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    not: TypedContractMethod<[data: BytesLike], [boolean], "view">;
    or: TypedContractMethod<[
        offsets: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    paused: TypedContractMethod<[], [boolean], "view">;
    permitAndCall: TypedContractMethod<[
        permit: BytesLike,
        action: BytesLike
    ], [
        void
    ], "payable">;
    rawRemainingInvalidatorForOrder: TypedContractMethod<[
        maker: AddressLike,
        orderHash: BytesLike
    ], [
        bigint
    ], "view">;
    remainingInvalidatorForOrder: TypedContractMethod<[
        maker: AddressLike,
        orderHash: BytesLike
    ], [
        bigint
    ], "view">;
    simulate: TypedContractMethod<[
        target: AddressLike,
        data: BytesLike
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
    getFunction(nameOrSignature: "and"): TypedContractMethod<[
        offsets: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "arbitraryStaticCall"): TypedContractMethod<[
        target: AddressLike,
        data: BytesLike
    ], [
        bigint
    ], "view">;
    getFunction(nameOrSignature: "bitInvalidatorForOrder"): TypedContractMethod<[
        maker: AddressLike,
        slot: BigNumberish
    ], [
        bigint
    ], "view">;
    getFunction(nameOrSignature: "bitsInvalidateForOrder"): TypedContractMethod<[
        makerTraits: BigNumberish,
        additionalMask: BigNumberish
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "cancelOrder"): TypedContractMethod<[
        makerTraits: BigNumberish,
        orderHash: BytesLike
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "cancelOrders"): TypedContractMethod<[
        makerTraits: BigNumberish[],
        orderHashes: BytesLike[]
    ], [
        void
    ], "nonpayable">;
    getFunction(nameOrSignature: "checkPredicate"): TypedContractMethod<[predicate: BytesLike], [boolean], "view">;
    getFunction(nameOrSignature: "eip712Domain"): TypedContractMethod<[
    ], [
        [
            string,
            string,
            string,
            bigint,
            string,
            string,
            bigint[]
        ] & {
            fields: string;
            name: string;
            version: string;
            chainId: bigint;
            verifyingContract: string;
            salt: string;
            extensions: bigint[];
        }
    ], "view">;
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
    getFunction(nameOrSignature: "eq"): TypedContractMethod<[
        value: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "fillContractOrder"): TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        signature: BytesLike,
        amount: BigNumberish,
        takerTraits: BigNumberish
    ], [
        [bigint, bigint, string]
    ], "nonpayable">;
    getFunction(nameOrSignature: "fillContractOrderArgs"): TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        signature: BytesLike,
        amount: BigNumberish,
        takerTraits: BigNumberish,
        args: BytesLike
    ], [
        [bigint, bigint, string]
    ], "nonpayable">;
    getFunction(nameOrSignature: "fillOrder"): TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        r: BytesLike,
        vs: BytesLike,
        amount: BigNumberish,
        takerTraits: BigNumberish
    ], [
        [bigint, bigint, string]
    ], "payable">;
    getFunction(nameOrSignature: "fillOrderArgs"): TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        r: BytesLike,
        vs: BytesLike,
        amount: BigNumberish,
        takerTraits: BigNumberish,
        args: BytesLike
    ], [
        [bigint, bigint, string]
    ], "payable">;
    getFunction(nameOrSignature: "gt"): TypedContractMethod<[
        value: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "hashOrder"): TypedContractMethod<[order: IOrderMixin.OrderStruct], [string], "view">;
    getFunction(nameOrSignature: "increaseEpoch"): TypedContractMethod<[series: BigNumberish], [void], "nonpayable">;
    getFunction(nameOrSignature: "lt"): TypedContractMethod<[
        value: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "not"): TypedContractMethod<[data: BytesLike], [boolean], "view">;
    getFunction(nameOrSignature: "or"): TypedContractMethod<[
        offsets: BigNumberish,
        data: BytesLike
    ], [
        boolean
    ], "view">;
    getFunction(nameOrSignature: "paused"): TypedContractMethod<[], [boolean], "view">;
    getFunction(nameOrSignature: "permitAndCall"): TypedContractMethod<[
        permit: BytesLike,
        action: BytesLike
    ], [
        void
    ], "payable">;
    getFunction(nameOrSignature: "rawRemainingInvalidatorForOrder"): TypedContractMethod<[
        maker: AddressLike,
        orderHash: BytesLike
    ], [
        bigint
    ], "view">;
    getFunction(nameOrSignature: "remainingInvalidatorForOrder"): TypedContractMethod<[
        maker: AddressLike,
        orderHash: BytesLike
    ], [
        bigint
    ], "view">;
    getFunction(nameOrSignature: "simulate"): TypedContractMethod<[
        target: AddressLike,
        data: BytesLike
    ], [
        void
    ], "nonpayable">;
    getEvent(key: "BitInvalidatorUpdated"): TypedContractEvent<BitInvalidatorUpdatedEvent.InputTuple, BitInvalidatorUpdatedEvent.OutputTuple, BitInvalidatorUpdatedEvent.OutputObject>;
    getEvent(key: "EIP712DomainChanged"): TypedContractEvent<EIP712DomainChangedEvent.InputTuple, EIP712DomainChangedEvent.OutputTuple, EIP712DomainChangedEvent.OutputObject>;
    getEvent(key: "EpochIncreased"): TypedContractEvent<EpochIncreasedEvent.InputTuple, EpochIncreasedEvent.OutputTuple, EpochIncreasedEvent.OutputObject>;
    getEvent(key: "OrderCancelled"): TypedContractEvent<OrderCancelledEvent.InputTuple, OrderCancelledEvent.OutputTuple, OrderCancelledEvent.OutputObject>;
    getEvent(key: "OrderFilled"): TypedContractEvent<OrderFilledEvent.InputTuple, OrderFilledEvent.OutputTuple, OrderFilledEvent.OutputObject>;
    getEvent(key: "Paused"): TypedContractEvent<PausedEvent.InputTuple, PausedEvent.OutputTuple, PausedEvent.OutputObject>;
    getEvent(key: "Unpaused"): TypedContractEvent<UnpausedEvent.InputTuple, UnpausedEvent.OutputTuple, UnpausedEvent.OutputObject>;
    filters: {
        "BitInvalidatorUpdated(address,uint256,uint256)": TypedContractEvent<BitInvalidatorUpdatedEvent.InputTuple, BitInvalidatorUpdatedEvent.OutputTuple, BitInvalidatorUpdatedEvent.OutputObject>;
        BitInvalidatorUpdated: TypedContractEvent<BitInvalidatorUpdatedEvent.InputTuple, BitInvalidatorUpdatedEvent.OutputTuple, BitInvalidatorUpdatedEvent.OutputObject>;
        "EIP712DomainChanged()": TypedContractEvent<EIP712DomainChangedEvent.InputTuple, EIP712DomainChangedEvent.OutputTuple, EIP712DomainChangedEvent.OutputObject>;
        EIP712DomainChanged: TypedContractEvent<EIP712DomainChangedEvent.InputTuple, EIP712DomainChangedEvent.OutputTuple, EIP712DomainChangedEvent.OutputObject>;
        "EpochIncreased(address,uint256,uint256)": TypedContractEvent<EpochIncreasedEvent.InputTuple, EpochIncreasedEvent.OutputTuple, EpochIncreasedEvent.OutputObject>;
        EpochIncreased: TypedContractEvent<EpochIncreasedEvent.InputTuple, EpochIncreasedEvent.OutputTuple, EpochIncreasedEvent.OutputObject>;
        "OrderCancelled(bytes32)": TypedContractEvent<OrderCancelledEvent.InputTuple, OrderCancelledEvent.OutputTuple, OrderCancelledEvent.OutputObject>;
        OrderCancelled: TypedContractEvent<OrderCancelledEvent.InputTuple, OrderCancelledEvent.OutputTuple, OrderCancelledEvent.OutputObject>;
        "OrderFilled(bytes32,uint256)": TypedContractEvent<OrderFilledEvent.InputTuple, OrderFilledEvent.OutputTuple, OrderFilledEvent.OutputObject>;
        OrderFilled: TypedContractEvent<OrderFilledEvent.InputTuple, OrderFilledEvent.OutputTuple, OrderFilledEvent.OutputObject>;
        "Paused(address)": TypedContractEvent<PausedEvent.InputTuple, PausedEvent.OutputTuple, PausedEvent.OutputObject>;
        Paused: TypedContractEvent<PausedEvent.InputTuple, PausedEvent.OutputTuple, PausedEvent.OutputObject>;
        "Unpaused(address)": TypedContractEvent<UnpausedEvent.InputTuple, UnpausedEvent.OutputTuple, UnpausedEvent.OutputObject>;
        Unpaused: TypedContractEvent<UnpausedEvent.InputTuple, UnpausedEvent.OutputTuple, UnpausedEvent.OutputObject>;
    };
}
//# sourceMappingURL=OrderMixin.d.ts.map