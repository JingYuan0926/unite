/**
 * Core types for the 1inch Agent Kit
 */

/**
 * The JSON‐schema part of an OpenAI function definition.
 */
export interface FunctionParametersSchema {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
    [key: string]: unknown; // Index signature for OpenAI compatibility
  }
  
  /**
   * What you pass into OpenAI's `functions: [...]`
   */
  export interface FunctionDefinition {
    name: string;
    description?: string;
    parameters: FunctionParametersSchema;
  }
  
  /**
   * A registry that
   * 1) Knows every FunctionDefinition
   * 2) Can dispatch a call by name+args
   */
  export interface FunctionRegistry {
    getFunctionDefinitions(): FunctionDefinition[];
    callFunction(name: string, args: Record<string, unknown>): Promise<unknown>;
  }
  
  /**
   * Configuration for the 1inch Agent Kit
   */
  export interface AgentKitConfig {
    openaiApiKey?: string;
    oneinchApiKey?: string;
    openaiModel?: string;
    baseUrl?: string;
  }
  
  /**
   * Response from the LLM Agent
   */
  export interface AgentResponse {
    content: string;
    functionCalls?: Array<{
      name: string;
      arguments: Record<string, unknown>;
      result?: unknown;
    }>;
  }
  
  /**
   * 1inch API Error Response
   */
  export interface OneInchError {
    statusCode: number;
    error: string;
    description: string;
    requestId: string;
  }
  
  /**
   * Common parameters for 1inch API calls
   */
  export interface ChainParams {
    chainId: number;
  }
  
  export interface TokenParams extends ChainParams {
    tokenAddress: string;
  }
  
  export interface QuoteParams extends ChainParams {
    src: string;
    dst: string;
    amount: string;
    from?: string;
    slippage?: number;
    disableEstimate?: boolean;
    gasPrice?: string;
    complexityLevel?: number;
    mainRouteParts?: number;
    parts?: number;
    gasLimit?: number;
    referrer?: string;
    receiver?: string;
    source?: string;
  }
  
  export interface SwapParams extends QuoteParams {
    tx: {
      from: string;
      to: string;
      data: string;
      value: string;
      gasPrice: string;
      gas: number;
    };
  } 
