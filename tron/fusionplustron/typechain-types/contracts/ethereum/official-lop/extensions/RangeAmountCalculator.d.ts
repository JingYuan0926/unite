import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedListener, TypedContractMethod } from "../../../../common";
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
export interface RangeAmountCalculatorInterface extends Interface {
    getFunction(nameOrSignature: "getMakingAmount" | "getRangeMakerAmount" | "getRangeTakerAmount" | "getTakingAmount"): FunctionFragment;
    encodeFunctionData(functionFragment: "getMakingAmount", values: [
        IOrderMixin.OrderStruct,
        BytesLike,
        BytesLike,
        AddressLike,
        BigNumberish,
        BigNumberish,
        BytesLike
    ]): string;
    encodeFunctionData(functionFragment: "getRangeMakerAmount", values: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
    ]): string;
    encodeFunctionData(functionFragment: "getRangeTakerAmount", values: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
    ]): string;
    encodeFunctionData(functionFragment: "getTakingAmount", values: [
        IOrderMixin.OrderStruct,
        BytesLike,
        BytesLike,
        AddressLike,
        BigNumberish,
        BigNumberish,
        BytesLike
    ]): string;
    decodeFunctionResult(functionFragment: "getMakingAmount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getRangeMakerAmount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getRangeTakerAmount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTakingAmount", data: BytesLike): Result;
}
export interface RangeAmountCalculator extends BaseContract {
    connect(runner?: ContractRunner | null): RangeAmountCalculator;
    waitForDeployment(): Promise<this>;
    interface: RangeAmountCalculatorInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    getMakingAmount: TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        arg1: BytesLike,
        arg2: BytesLike,
        arg3: AddressLike,
        takingAmount: BigNumberish,
        remainingMakingAmount: BigNumberish,
        extraData: BytesLike
    ], [
        bigint
    ], "view">;
    getRangeMakerAmount: TypedContractMethod<[
        priceStart: BigNumberish,
        priceEnd: BigNumberish,
        orderMakingAmount: BigNumberish,
        takingAmount: BigNumberish,
        remainingMakingAmount: BigNumberish
    ], [
        bigint
    ], "view">;
    getRangeTakerAmount: TypedContractMethod<[
        priceStart: BigNumberish,
        priceEnd: BigNumberish,
        orderMakingAmount: BigNumberish,
        makingAmount: BigNumberish,
        remainingMakingAmount: BigNumberish
    ], [
        bigint
    ], "view">;
    getTakingAmount: TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        arg1: BytesLike,
        arg2: BytesLike,
        arg3: AddressLike,
        makingAmount: BigNumberish,
        remainingMakingAmount: BigNumberish,
        extraData: BytesLike
    ], [
        bigint
    ], "view">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "getMakingAmount"): TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        arg1: BytesLike,
        arg2: BytesLike,
        arg3: AddressLike,
        takingAmount: BigNumberish,
        remainingMakingAmount: BigNumberish,
        extraData: BytesLike
    ], [
        bigint
    ], "view">;
    getFunction(nameOrSignature: "getRangeMakerAmount"): TypedContractMethod<[
        priceStart: BigNumberish,
        priceEnd: BigNumberish,
        orderMakingAmount: BigNumberish,
        takingAmount: BigNumberish,
        remainingMakingAmount: BigNumberish
    ], [
        bigint
    ], "view">;
    getFunction(nameOrSignature: "getRangeTakerAmount"): TypedContractMethod<[
        priceStart: BigNumberish,
        priceEnd: BigNumberish,
        orderMakingAmount: BigNumberish,
        makingAmount: BigNumberish,
        remainingMakingAmount: BigNumberish
    ], [
        bigint
    ], "view">;
    getFunction(nameOrSignature: "getTakingAmount"): TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        arg1: BytesLike,
        arg2: BytesLike,
        arg3: AddressLike,
        makingAmount: BigNumberish,
        remainingMakingAmount: BigNumberish,
        extraData: BytesLike
    ], [
        bigint
    ], "view">;
    filters: {};
}
//# sourceMappingURL=RangeAmountCalculator.d.ts.map