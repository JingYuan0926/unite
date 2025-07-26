import OpenAI from "openai";
import registry from "./registry";
import { FunctionDefinition, AgentKitConfig, AgentResponse } from "./types";
import { logger } from "../utils/logger";

/**
 * 1inch Agent Kit - Connect any LLM to 1inch DeFi protocols
 */
export class OneInchAgentKit {
  private openai: OpenAI;
  private config: AgentKitConfig;

  constructor(config: AgentKitConfig = {}) {
    this.config = {
      openaiModel: "gpt-4o-mini",
      ...config,
    };

    const apiKey = this.config.openaiApiKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it in config.");
    }

    this.openai = new OpenAI({
      apiKey,
      baseURL: this.config.baseUrl,
    });
  }

  /**
   * Send a user prompt → let the model call your functions → return final answer.
   */
  async chat(userPrompt: string): Promise<AgentResponse> {
    // Initialize registry if not already done
    await registry.init();
    
    logger.info("Starting chat with prompt:", userPrompt);
    
    // 1) ask the model, giving it all your function definitions
    const fnDefs: FunctionDefinition[] = registry.getFunctionDefinitions();
    logger.info(`Available functions: ${fnDefs.map(f => f.name).join(', ')}`);
    
    // Debug: Log the tracesAPI function definition
    const tracesAPIDef = fnDefs.find(f => f.name === 'tracesAPI');
    if (tracesAPIDef) {
        logger.info('tracesAPI function definition:', JSON.stringify(tracesAPIDef, null, 2));
    } else {
        logger.error('tracesAPI function not found in registry!');
    }

    const first = await this.openai.chat.completions.create({
      model: this.config.openaiModel!,
      messages: [{ role: "user", content: userPrompt }],
      tools: fnDefs.map(def => ({
        type: "function" as const,
        function: def
      })),
      tool_choice: "auto",
    });

    const msg = first.choices[0].message!;
    logger.info("First response received:", msg);
    
    // 2) If it didn't call a function, just return the text
    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      logger.info("No function calls made, returning direct response");
      return {
        content: msg.content ?? "",
      };
    }

    // 3) Otherwise, parse arguments & invoke your handler
    const functionCalls: AgentResponse['functionCalls'] = [];
    
    for (const toolCall of msg.tool_calls) {
      const { name, arguments: argStr } = toolCall.function;
      logger.info(`Raw function call - name: ${name}, arguments: ${argStr}`);
      const args = JSON.parse(argStr || "{}");
      
      logger.info(`Calling function: ${name} with args:`, args);
      
      try {
        const result = await registry.callFunction(name, args);
        functionCalls.push({
          name,
          arguments: args,
          result,
        });
        logger.info(`Function ${name} completed successfully`);
      } catch (error) {
        logger.error(`Function ${name} failed:`, error);
        functionCalls.push({
          name,
          arguments: args,
          result: { error: error instanceof Error ? error.message : String(error) },
        });
      }
    }

    // 4) Send the function's results back into the chat for a final response
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "user", content: userPrompt },
      msg,
    ];

    // Add function results - match by index to avoid duplicates
    for (let i = 0; i < functionCalls.length; i++) {
      const call = functionCalls[i];
      const toolCall = msg.tool_calls![i]; // Use index instead of find()
      if (toolCall && toolCall.function.name === call.name) {
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(call.result),
        });
      }
    }

    const second = await this.openai.chat.completions.create({
      model: this.config.openaiModel!,
      messages,
    });

    const finalMessage = second.choices[0].message;
    logger.debug("Final response received:", finalMessage);

    return {
      content: finalMessage?.content ?? "",
      functionCalls,
    };
  }

  /**
   * Get available functions
   */
  async getAvailableFunctions(): Promise<string[]> {
    await registry.init();
    return registry.getAvailableFunctions();
  }

  /**
   * Check if a specific function is available
   */
  async hasFunction(name: string): Promise<boolean> {
    await registry.init();
    return registry.hasFunction(name);
  }

  /**
   * Get function definitions for external use
   */
  async getFunctionDefinitions(): Promise<FunctionDefinition[]> {
    await registry.init();
    return registry.getFunctionDefinitions();
  }
}

/**
 * Convenience function for quick usage
 */
export async function createAgent(config?: AgentKitConfig): Promise<OneInchAgentKit> {
  return new OneInchAgentKit(config);
}

/**
 * Legacy function for backward compatibility
 */
export async function llmAgent(userPrompt: string, config?: AgentKitConfig): Promise<string> {
  const agent = new OneInchAgentKit(config);
  const response = await agent.chat(userPrompt);
  return response.content;
} 