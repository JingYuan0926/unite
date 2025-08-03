import type { BaseContract, BigNumberish, BytesLike, FunctionFragment, Result, Interface, ContractRunner, ContractMethod, Listener } from "ethers";
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
export interface TakerContractInterface extends Interface {
    getFunction(nameOrSignature: "fillOrder"): FunctionFragment;
    encodeFunctionData(functionFragment: "fillOrder", values: [
        IOrderMixin.OrderStruct,
        BytesLike,
        BytesLike,
        BigNumberish,
        BigNumberish
    ]): string;
    decodeFunctionResult(functionFragment: "fillOrder", data: BytesLike): Result;
}
export interface TakerContract extends BaseContract {
    connect(runner?: ContractRunner | null): TakerContract;
    waitForDeployment(): Promise<this>;
    interface: TakerContractInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    fillOrder: TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        r: BytesLike,
        vs: BytesLike,
        amount: BigNumberish,
        takerTraits: BigNumberish
    ], [
        void
    ], "payable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "fillOrder"): TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        r: BytesLike,
        vs: BytesLike,
        amount: BigNumberish,
        takerTraits: BigNumberish
    ], [
        void
    ], "payable">;
    filters: {};
}
//# sourceMappingURL=TakerContract.d.ts.map