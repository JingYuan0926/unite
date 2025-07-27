import fs from "fs/promises";
import path from "path";
import { FunctionDefinition, FunctionRegistry } from "./types";
import { logger } from "../utils/logger";

// Determine the correct functions root path
// Check if we're running in development mode by looking for ts-node in process.argv
const isDevelopment = process.argv.some(arg => arg.includes('ts-node')) || 
                     process.argv.some(arg => arg.includes('ts-node-esm')) ||
                     process.argv.some(arg => arg.includes('tsx'));

// More robust path resolution
const getFunctionsRoot = () => {
  if (isDevelopment) {
    // When running with ts-node, resolve from current working directory
    return path.resolve(process.cwd(), "src/functions");
  } else {
    // When running compiled code, resolve from __dirname
    return path.resolve(__dirname, "../functions");
  }
};

const FUNCTIONS_ROOT = getFunctionsRoot();

class Registry implements FunctionRegistry {
  private defs: FunctionDefinition[] = [];
  private handlers: Record<string, (args: any) => Promise<any>> = {};
  private initialized = false;

  /** Scan every subfolder under functions */
  async init() {
    if (this.initialized) return;
    
    logger.info("Initializing function registry...");
    logger.debug(`Functions root: ${FUNCTIONS_ROOT}`);
    logger.debug(`Development mode: ${isDevelopment}`);
    logger.debug(`Current working directory: ${process.cwd()}`);
    logger.debug(`Process argv: ${process.argv.join(' ')}`);
    
    try {
      const entries = await fs.readdir(FUNCTIONS_ROOT, { withFileTypes: true });
      logger.debug(`Found entries: ${entries.map(e => e.name).join(', ')}`);
      
      for (const e of entries) {
        if (!e.isDirectory()) continue;

        const fnName = e.name;
        logger.debug(`Loading function: ${fnName}`);
        
        const fnDir = path.join(FUNCTIONS_ROOT, fnName);
        const schemaPath = path.join(fnDir, "schema.json");
        
        // In development (ts-node), look for .ts files, in production look for .js files
        const codePath = isDevelopment 
          ? path.join(fnDir, "index.ts")
          : path.join(fnDir, "index.js");
        
        logger.debug(`Using code path: ${codePath}`);

        // Check if the code file exists
        if (!(await this.fileExists(codePath))) {
          logger.warn(`Code file not found: ${codePath}, skipping function: ${fnName}`);
          continue;
        }

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
    return await fn(args);
  }

  getAvailableFunctions(): string[] {
    if (!this.initialized) {
      throw new Error("Registry not initialized. Call init() first.");
    }
    return this.defs.map(d => d.name);
  }

  hasFunction(name: string): boolean {
    if (!this.initialized) {
      throw new Error("Registry not initialized. Call init() first.");
    }
    return this.handlers.hasOwnProperty(name);
  }
}

export default new Registry(); 