import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TaskScheduler } from '../../src/tasks/taskScheduler';
import { taskManager } from '../../src/tasks';
import { getAgent } from '../../src/agents';

// Mock dependencies
vi.mock('../../src/tasks', () => ({
  taskManager: {
    getNextTasks: vi.fn(),
    updateTaskStatus: vi.fn()
  }
}));

vi.mock('../../src/agents', () => ({
  getAgent: vi.fn()
}));

vi.mock('../../src/utils/errorHandler', () => ({
  errorHandler: {
    retryOperation: vi.fn().mockImplementation((fn) => fn()),
    handleError: vi.fn()
  }
}));

vi.mock('../../src/memory/contextMemory', () => ({
  contextMemory: {
    addMemory: vi.fn()
  }
}));

describe('TaskScheduler', () => {
  let taskScheduler: TaskScheduler;
  
  beforeEach(() => {
    taskScheduler = new TaskScheduler();
    
    // Reset mocks
    vi.mocked(taskManager.getNextTasks).mockReset();
    vi.mocked(taskManager.updateTaskStatus).mockReset();
    vi.mocked(getAgent).mockReset();
    
    // Mock setInterval and clearInterval
    vi.spyOn(global, 'setInterval').mockImplementation((callback: any) => {
      callback();
      return 123 as any;
    });
    
    vi.spyOn(global, 'clearInterval').mockImplementation(() => {});
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('should start and stop the scheduler', () => {
    // Mock empty task list
    vi.mocked(taskManager.getNextTasks).mockReturnValue([]);
    
    // Start the scheduler
    taskScheduler.start();
    
    // Check if setInterval was called
    expect(setInterval).toHaveBeenCalled();
    expect(taskScheduler['running']).toBe(true);
    expect(taskScheduler['intervalId']).toBe(123);
    
    // Stop the scheduler
    taskScheduler.stop();
    
    // Check if clearInterval was called
    expect(clearInterval).toHaveBeenCalledWith(123);
    expect(taskScheduler['running']).toBe(false);
    expect(taskScheduler['intervalId']).toBe(null);
  });
  
  it('should not start the scheduler if already running', () => {
    // Mock empty task list
    vi.mocked(taskManager.getNextTasks).mockReturnValue([]);
    
    // Start the scheduler
    taskScheduler.start();
    
    // Reset the mock
    vi.mocked(setInterval).mockClear();
    
    // Try to start again
    taskScheduler.start();
    
    // Check that setInterval was not called again
    expect(setInterval).not.toHaveBeenCalled();
  });
  
  it('should not stop the scheduler if not running', () => {
    // Try to stop without starting
    taskScheduler.stop();
    
    // Check that clearInterval was not called
    expect(clearInterval).not.toHaveBeenCalled();
  });
  
  it('should process tasks when scheduled', async () => {
    // Create a mock task
    const mockTask = {
      id: 'task-1',
      title: 'Test Task',
      description: 'Test Description',
      assignedTo: 'intern',
      status: 'pending',
      priority: 'medium',
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Mock the agent
    const mockAgent = {
      executeTask: vi.fn().mockResolvedValue('Task executed successfully')
    };
    
    // Setup mocks
    vi.mocked(taskManager.getNextTasks).mockReturnValue([mockTask]);
    vi.mocked(getAgent).mockReturnValue(mockAgent as any);
    
    // Start the scheduler (which will immediately call scheduleTasks)
    taskScheduler.start();
    
    // Wait for any promises to resolve
    await vi.runAllTimersAsync();
    
    // Check that the task was processed
    expect(taskManager.updateTaskStatus).toHaveBeenCalledWith(mockTask.id, 'in-progress');
    expect(getAgent).toHaveBeenCalledWith(mockTask.assignedTo);
    expect(mockAgent.executeTask).toHaveBeenCalledWith(mockTask.description);
    expect(taskManager.updateTaskStatus).toHaveBeenCalledWith(mockTask.id, 'completed');
  });
  
  it('should handle missing agents', async () => {
    // Create a mock task
    const mockTask = {
      id: 'task-1',
      title: 'Test Task',
      description: 'Test Description',
      assignedTo: 'non-existent-agent',
      status: 'pending',
      priority: 'medium',
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Setup mocks
    vi.mocked(taskManager.getNextTasks).mockReturnValue([mockTask]);
    vi.mocked(getAgent).mockReturnValue(undefined);
    
    // Start the scheduler (which will immediately call scheduleTasks)
    taskScheduler.start();
    
    // Wait for any promises to resolve
    await vi.runAllTimersAsync();
    
    // Check that the task was marked as failed
    expect(taskManager.updateTaskStatus).toHaveBeenCalledWith(mockTask.id, 'in-progress');
    expect(getAgent).toHaveBeenCalledWith(mockTask.assignedTo);
    expect(taskManager.updateTaskStatus).toHaveBeenCalledWith(mockTask.id, 'failed');
  });
  
  it('should handle task execution errors', async () => {
    // Create a mock task
    const mockTask = {
      id: 'task-1',
      title: 'Test Task',
      description: 'Test Description',
      assignedTo: 'intern',
      status: 'pending',
      priority: 'medium',
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Mock the agent with an error
    const mockAgent = {
      executeTask: vi.fn().mockRejectedValue(new Error('Task execution failed'))
    };
    
    // Setup mocks
    vi.mocked(taskManager.getNextTasks).mockReturnValue([mockTask]);
    vi.mocked(getAgent).mockReturnValue(mockAgent as any);
    
    // Start the scheduler (which will immediately call scheduleTasks)
    taskScheduler.start();
    
    // Wait for any promises to resolve
    await vi.runAllTimersAsync();
    
    // Check that the task was marked as failed
    expect(taskManager.updateTaskStatus).toHaveBeenCalledWith(mockTask.id, 'in-progress');
    expect(getAgent).toHaveBeenCalledWith(mockTask.assignedTo);
    expect(mockAgent.executeTask).toHaveBeenCalledWith(mockTask.description);
    expect(taskManager.updateTaskStatus).toHaveBeenCalledWith(mockTask.id, 'failed');
  });
  
  it('should respect max concurrent tasks limit', async () => {
    // Set max concurrent tasks to 2
    taskScheduler.setMaxConcurrentTasks(2);
    
    // Create mock tasks
    const mockTasks = [
      {
        id: 'task-1',
        title: 'Test Task 1',
        description: 'Test Description 1',
        assignedTo: 'intern',
        status: 'pending',
        priority: 'medium',
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'task-2',
        title: 'Test Task 2',
        description: 'Test Description 2',
        assignedTo: 'junior',
        status: 'pending',
        priority: 'medium',
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'task-3',
        title: 'Test Task 3',
        description: 'Test Description 3',
        assignedTo: 'senior',
        status: 'pending',
        priority: 'medium',
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Mock the agents
    const mockAgent = {
      executeTask: vi.fn().mockResolvedValue('Task executed successfully')
    };
    
    // Setup mocks
    vi.mocked(taskManager.getNextTasks).mockReturnValue(mockTasks);
    vi.mocked(getAgent).mockReturnValue(mockAgent as any);
    
    // Manually add two tasks to currently running tasks
    taskScheduler['currentlyRunningTasks'].add('task-1');
    taskScheduler['currentlyRunningTasks'].add('task-2');
    
    // Call scheduleTasks directly
    await taskScheduler['scheduleTasks']();
    
    // Check that no new tasks were processed due to the limit
    expect(taskManager.updateTaskStatus).not.toHaveBeenCalled();
    expect(getAgent).not.toHaveBeenCalled();
    expect(mockAgent.executeTask).not.toHaveBeenCalled();
  });
  
  it('should prioritize tasks by priority', async () => {
    // Create mock tasks with different priorities
    const mockTasks = [
      {
        id: 'task-1',
        title: 'Low Priority Task',
        description: 'Test Description 1',
        assignedTo: 'intern',
        status: 'pending',
        priority: 'low',
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'task-2',
        title: 'Medium Priority Task',
        description: 'Test Description 2',
        assignedTo: 'junior',
        status: 'pending',
        priority: 'medium',
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'task-3',
        title: 'High Priority Task',
        description: 'Test Description 3',
        assignedTo: 'senior',
        status: 'pending',
        priority: 'high',
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Mock the agent
    const mockAgent = {
      executeTask: vi.fn().mockImplementation(async (description) => {
        // Simulate task execution
        return `Executed: ${description}`;
      })
    };
    
    // Setup mocks
    vi.mocked(taskManager.getNextTasks).mockReturnValue(mockTasks);
    vi.mocked(getAgent).mockReturnValue(mockAgent as any);
    
    // Set max concurrent tasks to 1 to ensure only one task is processed
    taskScheduler.setMaxConcurrentTasks(1);
    
    // Call scheduleTasks directly
    await taskScheduler['scheduleTasks']();
    
    // Check that the high priority task was processed first
    expect(taskManager.updateTaskStatus).toHaveBeenCalledWith('task-3', 'in-progress');
    expect(getAgent).toHaveBeenCalledWith('senior');
    expect(mockAgent.executeTask).toHaveBeenCalledWith('Test Description 3');
  });
});
