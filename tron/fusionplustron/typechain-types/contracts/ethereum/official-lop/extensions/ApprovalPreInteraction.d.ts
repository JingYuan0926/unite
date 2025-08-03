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
export interface ApprovalPreInteractionInterface extends Interface {
    getFunction(nameOrSignature: "IMMUTABLE_OWNER" | "isValidSignature" | "preInteraction"): FunctionFragment;
    encodeFunctionData(functionFragment: "IMMUTABLE_OWNER", values?: undefined): string;
    encodeFunctionData(functionFragment: "isValidSignature", values: [BytesLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "preInteraction", values: [
        IOrderMixin.OrderStruct,
        BytesLike,
        BytesLike,
        AddressLike,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BytesLike
    ]): string;
    decodeFunctionResult(functionFragment: "IMMUTABLE_OWNER", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isValidSignature", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "preInteraction", data: BytesLike): Result;
}
export interface ApprovalPreInteraction extends BaseContract {
    connect(runner?: ContractRunner | null): ApprovalPreInteraction;
    waitForDeployment(): Promise<this>;
    interface: ApprovalPreInteractionInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    IMMUTABLE_OWNER: TypedContractMethod<[], [string], "view">;
    isValidSignature: TypedContractMethod<[
        orderHash: BytesLike,
        signature: BytesLike
    ], [
        string
    ], "view">;
    preInteraction: TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        arg1: BytesLike,
        arg2: BytesLike,
        arg3: AddressLike,
        makingAmount: BigNumberish,
        arg5: BigNumberish,
        arg6: BigNumberish,
        arg7: BytesLike
    ], [
        void
    ], "nonpayable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "IMMUTABLE_OWNER"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "isValidSignature"): TypedContractMethod<[
        orderHash: BytesLike,
        signature: BytesLike
    ], [
        string
    ], "view">;
    getFunction(nameOrSignature: "preInteraction"): TypedContractMethod<[
        order: IOrderMixin.OrderStruct,
        arg1: BytesLike,
        arg2: BytesLike,
        arg3: AddressLike,
        makingAmount: BigNumberish,
        arg5: BigNumberish,
        arg6: BigNumberish,
        arg7: BytesLike
    ], [
        void
    ], "nonpayable">;
    filters: {};
}
//# sourceMappingURL=ApprovalPreInteraction.d.ts.map