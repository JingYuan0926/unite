import fs from "fs/promises";
import path from "path";
import { FunctionDefinition, FunctionRegistry } from "./types";
import { logger } from "../utils/logger";

const FUNCTIONS_ROOT = path.resolve(__dirname, "../functions");

class Registry implements FunctionRegistry {
  private defs: FunctionDefinition[] = [];
  private handlers: Record<string, (args: any) => Promise<any>> = {};
  private initialized = false;

  /** Scan every subfolder under src/functions */
  async init() {
    if (this.initialized) return;
    
    logger.info("Initializing function registry...");
    logger.debug(`Functions root: ${FUNCTIONS_ROOT}`);
    
    try {
      const entries = await fs.readdir(FUNCTIONS_ROOT, { withFileTypes: true });
      logger.debug(`Found entries: ${entries.map(e => e.name).join(', ')}`);
      
      for (const e of entries) {
        if (!e.isDirectory()) continue;

        const fnName = e.name;
        logger.debug(`Loading function: ${fnName}`);
        
        const fnDir = path.join(FUNCTIONS_ROOT, fnName);
        const schemaPath = path.join(fnDir, "schema.json");
        const codePath = path.join(fnDir, "index.js");
        
        logger.debug(`Using code path: ${codePath}`);

        // 1) load JSON schema
        const raw = await fs.readFile(schemaPath, "utf-8");
        const schema = JSON.parse(raw) as FunctionDefinition;

        this.defs.push(schema);
        logger.debug(`Loaded schema for: ${schema.name}`);

        // 2) dynamic import of the code file
        const mod = await import(codePath);
        // assume named export matches folder name, else default export
        const handler = mod[fnName] ?? mod.default;
        if (typeof handler !== "function") {
          throw new Error(`No function export found in ${codePath}`);
        }
        this.handlers[schema.name] = handler;
        logger.debug(`Loaded handler for: ${schema.name}`);
      }
      
      this.initialized = true;
      logger.info(`Registry initialized with ${this.defs.length} functions`);
    } catch (error) {
      logger.error("Failed to initialize registry:", error);
      throw error;
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  getFunctionDefinitions(): FunctionDefinition[] {
    if (!this.initialized) {
      throw new Error("Registry not initialized. Call init() first.");
    }
    return this.defs;
  }

  async callFunction(name: string, args: Record<string, unknown>) {
    if (!this.initialized) {
      throw new Error("Registry not initialized. Call init() first.");
    }
    const fn = this.handlers[name];
    if (!fn) throw new Error(`Function "${name}" not registered`);
    
    logger.debug(`Calling function: ${name} with args:`, args);
    try {
      const result = await fn(args);
      logger.debug(`Function ${name} completed successfully`);
      return result;
    } catch (error) {
      logger.error(`Function ${name} failed:`, error);
      throw error;
    }
  }

  /**
   * Get list of available function names
   */
  getAvailableFunctions(): string[] {
    return Object.keys(this.handlers);
  }

  /**
   * Check if a function is available
   */
  hasFunction(name: string): boolean {
    return name in this.handlers;
  }
}

// Create singleton instance
const registry = new Registry();

export default registry; 