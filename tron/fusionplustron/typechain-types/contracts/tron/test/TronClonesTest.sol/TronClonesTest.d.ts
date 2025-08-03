import type { BaseContract, BytesLike, FunctionFragment, Result, Interface, EventFragment, AddressLike, ContractRunner, ContractMethod, Listener } from "ethers";
import type { TypedContractEvent, TypedDeferredTopicFilter, TypedEventLog, TypedLogDescription, TypedListener, TypedContractMethod } from "../../../../common";
export interface TronClonesTestInterface extends Interface {
    getFunction(nameOrSignature: "IMPLEMENTATION" | "getImplementation" | "testAddressPrediction" | "testCloneDeterministic" | "testCloneWithValue"): FunctionFragment;
    getEvent(nameOrSignatureOrTopic: "AddressPredicted" | "CloneDeployed"): EventFragment;
    encodeFunctionData(functionFragment: "IMPLEMENTATION", values?: undefined): string;
    encodeFunctionData(functionFragment: "getImplementation", values?: undefined): string;
    encodeFunctionData(functionFragment: "testAddressPrediction", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "testCloneDeterministic", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "testCloneWithValue", values: [BytesLike]): string;
    decodeFunctionResult(functionFragment: "IMPLEMENTATION", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getImplementation", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "testAddressPrediction", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "testCloneDeterministic", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "testCloneWithValue", data: BytesLike): Result;
}
export declare namespace AddressPredictedEvent {
    type InputTuple = [
        predicted: AddressLike,
        actual: AddressLike,
        matches: boolean
    ];
    type OutputTuple = [
        predicted: string,
        actual: string,
        matches: boolean
    ];
    interface OutputObject {
        predicted: string;
        actual: string;
        matches: boolean;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export declare namespace CloneDeployedEvent {
    type InputTuple = [
        clone: AddressLike,
        implementation: AddressLike,
        salt: BytesLike
    ];
    type OutputTuple = [
        clone: string,
        implementation: string,
        salt: string
    ];
    interface OutputObject {
        clone: string;
        implementation: string;
        salt: string;
    }
    type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
    type Filter = TypedDeferredTopicFilter<Event>;
    type Log = TypedEventLog<Event>;
    type LogDescription = TypedLogDescription<Event>;
}
export interface TronClonesTest extends BaseContract {
    connect(runner?: ContractRunner | null): TronClonesTest;
    waitForDeployment(): Promise<this>;
    interface: TronClonesTestInterface;
    queryFilter<TCEvent extends TypedContractEvent>(event: TCEvent, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    queryFilter<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TypedEventLog<TCEvent>>>;
    on<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    on<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(event: TCEvent, listener: TypedListener<TCEvent>): Promise<this>;
    once<TCEvent extends TypedContractEvent>(filter: TypedDeferredTopicFilter<TCEvent>, listener: TypedListener<TCEvent>): Promise<this>;
    listeners<TCEvent extends TypedContractEvent>(event: TCEvent): Promise<Array<TypedListener<TCEvent>>>;
    listeners(eventName?: string): Promise<Array<Listener>>;
    removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;
    IMPLEMENTATION: TypedContractMethod<[], [string], "view">;
    getImplementation: TypedContractMethod<[], [string], "view">;
    testAddressPrediction: TypedContractMethod<[
        salt: BytesLike
    ], [
        [
            string,
            string,
            boolean
        ] & {
            predicted: string;
            actual: string;
            matches: boolean;
        }
    ], "nonpayable">;
    testCloneDeterministic: TypedContractMethod<[
        salt: BytesLike
    ], [
        string
    ], "nonpayable">;
    testCloneWithValue: TypedContractMethod<[
        salt: BytesLike
    ], [
        string
    ], "payable">;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getFunction(nameOrSignature: "IMPLEMENTATION"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "getImplementation"): TypedContractMethod<[], [string], "view">;
    getFunction(nameOrSignature: "testAddressPrediction"): TypedContractMethod<[
        salt: BytesLike
    ], [
        [
            string,
            string,
            boolean
        ] & {
            predicted: string;
            actual: string;
            matches: boolean;
        }
    ], "nonpayable">;
    getFunction(nameOrSignature: "testCloneDeterministic"): TypedContractMethod<[salt: BytesLike], [string], "nonpayable">;
    getFunction(nameOrSignature: "testCloneWithValue"): TypedContractMethod<[salt: BytesLike], [string], "payable">;
    getEvent(key: "AddressPredicted"): TypedContractEvent<AddressPredictedEvent.InputTuple, AddressPredictedEvent.OutputTuple, AddressPredictedEvent.OutputObject>;
    getEvent(key: "CloneDeployed"): TypedContractEvent<CloneDeployedEvent.InputTuple, CloneDeployedEvent.OutputTuple, CloneDeployedEvent.OutputObject>;
    filters: {
        "AddressPredicted(address,address,bool)": TypedContractEvent<AddressPredictedEvent.InputTuple, AddressPredictedEvent.OutputTuple, AddressPredictedEvent.OutputObject>;
        AddressPredicted: TypedContractEvent<AddressPredictedEvent.InputTuple, AddressPredictedEvent.OutputTuple, AddressPredictedEvent.OutputObject>;
        "CloneDeployed(address,address,bytes32)": TypedContractEvent<CloneDeployedEvent.InputTuple, CloneDeployedEvent.OutputTuple, CloneDeployedEvent.OutputObject>;
        CloneDeployed: TypedContractEvent<CloneDeployedEvent.InputTuple, CloneDeployedEvent.OutputTuple, CloneDeployedEvent.OutputObject>;
    };
}
//# sourceMappingURL=TronClonesTest.d.ts.map