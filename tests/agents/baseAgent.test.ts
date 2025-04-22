import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BaseAgent } from '../../src/agents/baseAgent';

// Mock dependencies
vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn().mockImplementation(() => ({
    // Mock methods as needed
  }))
}));

vi.mock('langchain/agents', () => ({
  AgentExecutor: {
    fromAgentAndTools: vi.fn().mockImplementation(() => ({
      invoke: vi.fn().mockResolvedValue({ output: 'Task executed successfully' })
    }))
  },
  createReactAgent: vi.fn()
}));

vi.mock('../utils/fileManager', () => ({
  fileManager: {
    createFile: vi.fn().mockResolvedValue(true),
    updateFile: vi.fn().mockResolvedValue(true),
    readFile: vi.fn().mockResolvedValue('file content'),
    deleteFile: vi.fn().mockResolvedValue(true),
    listFiles: vi.fn().mockResolvedValue(['file1.js', 'file2.js'])
  }
}));

vi.mock('../utils/execRunner', () => ({
  execRunner: {
    executeCommand: vi.fn().mockResolvedValue('command output')
  }
}));

vi.mock('../utils/errorHandler', () => ({
  errorHandler: {
    retryOperation: vi.fn().mockImplementation((fn) => fn()),
    handleError: vi.fn()
  }
}));

vi.mock('../memory/contextMemory', () => ({
  contextMemory: {
    addMemory: vi.fn()
  }
}));

describe('BaseAgent', () => {
  let agent: BaseAgent;

  beforeEach(() => {
    agent = new BaseAgent('TestAgent', 'Tester', 'A test agent');
    agent.initialize();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct properties', () => {
    expect(agent.name).toBe('TestAgent');
    expect(agent.role).toBe('Tester');
    expect(agent.description).toBe('A test agent');
    expect(agent.memory).toEqual({
      tasks: [],
      executionHistory: [],
      contextualMemory: {}
    });
    expect(agent.executor).not.toBeNull();
  });

  it('should add tasks to memory', () => {
    agent.addTask('Test task 1');
    agent.addTask('Test task 2');
    
    expect(agent.memory.tasks).toEqual(['Test task 1', 'Test task 2']);
  });

  it('should clear tasks from memory', () => {
    agent.addTask('Test task 1');
    agent.addTask('Test task 2');
    agent.clearTasks();
    
    expect(agent.memory.tasks).toEqual([]);
  });

  it('should execute tasks and update execution history', async () => {
    const result = await agent.executeTask('Test task');
    
    expect(result).toBe('Task executed successfully');
    expect(agent.memory.executionHistory).toEqual([
      'Task: Test task\nResult: Task executed successfully'
    ]);
  });

  it('should handle errors during task execution', async () => {
    // Mock the executor to throw an error
    agent.executor = {
      invoke: vi.fn().mockRejectedValue(new Error('Task execution failed'))
    } as any;
    
    const result = await agent.executeTask('Failed task');
    
    expect(result).toContain('Error:');
    expect(agent.memory.executionHistory[0]).toContain('Error: Task execution failed');
  });

  it('should add and retrieve contextual memory', () => {
    agent.addToContextualMemory('testKey', 'testValue');
    
    expect(agent.getFromContextualMemory('testKey')).toBe('testValue');
    expect(agent.memory.contextualMemory).toEqual({ testKey: 'testValue' });
  });

  it('should get recent execution history', () => {
    agent.memory.executionHistory = [
      'History 1',
      'History 2',
      'History 3',
      'History 4',
      'History 5',
      'History 6'
    ];
    
    const recentHistory = agent.getRecentHistory(3);
    
    expect(recentHistory).toEqual(['History 4', 'History 5', 'History 6']);
    expect(recentHistory.length).toBe(3);
  });
});
