// Jest setup file for test environment
import { config } from "dotenv";

// Load environment variables for tests
config();

// Set test timeout
jest.setTimeout(60000);

// Mock console methods for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Only show errors in test output
  console.log = jest.fn();
  console.error = originalConsoleError;
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
