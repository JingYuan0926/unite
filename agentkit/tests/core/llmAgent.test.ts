import { OneInchAgentKit } from '../../src/core/llmAgent';

describe('OneInchAgentKit', () => {
  let agent: OneInchAgentKit;

  beforeEach(() => {
    // Mock environment variables for testing
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.ONEINCH_API_KEY = 'test-1inch-key';
    
    agent = new OneInchAgentKit();
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.ONEINCH_API_KEY;
  });

  test('should create agent instance', () => {
    expect(agent).toBeInstanceOf(OneInchAgentKit);
  });

  test('should throw error without OpenAI API key', () => {
    delete process.env.OPENAI_API_KEY;
    expect(() => new OneInchAgentKit()).toThrow('OpenAI API key is required');
  });

  test('should accept API keys in config', () => {
    const agentWithConfig = new OneInchAgentKit({
      openaiApiKey: 'custom-openai-key',
      oneinchApiKey: 'custom-1inch-key',
    });
    expect(agentWithConfig).toBeInstanceOf(OneInchAgentKit);
  });
}); 