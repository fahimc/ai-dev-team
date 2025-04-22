import { describe, it, expect, beforeEach } from 'vitest';
import { TaskManager, Task } from '../../src/tasks';

describe('TaskManager', () => {
  let taskManager: TaskManager;

  beforeEach(() => {
    taskManager = new TaskManager();
  });

  it('should create a task with correct properties', () => {
    const task = taskManager.createTask(
      'Test Task',
      'This is a test task',
      'intern',
      'medium',
      []
    );

    expect(task.title).toBe('Test Task');
    expect(task.description).toBe('This is a test task');
    expect(task.assignedTo).toBe('intern');
    expect(task.status).toBe('pending');
    expect(task.priority).toBe('medium');
    expect(task.dependencies).toEqual([]);
    expect(task.id).toBeDefined();
  });

  it('should retrieve a task by id', () => {
    const task = taskManager.createTask(
      'Test Task',
      'This is a test task',
      'intern'
    );

    const retrievedTask = taskManager.getTask(task.id);
    expect(retrievedTask).toEqual(task);
  });

  it('should return undefined for non-existent task id', () => {
    const retrievedTask = taskManager.getTask('non-existent-id');
    expect(retrievedTask).toBeUndefined();
  });

  it('should get all tasks', () => {
    taskManager.createTask('Task 1', 'Description 1', 'intern');
    taskManager.createTask('Task 2', 'Description 2', 'junior');
    taskManager.createTask('Task 3', 'Description 3', 'senior');

    const allTasks = taskManager.getAllTasks();
    expect(allTasks.length).toBe(3);
    expect(allTasks[0].title).toBe('Task 1');
    expect(allTasks[1].title).toBe('Task 2');
    expect(allTasks[2].title).toBe('Task 3');
  });

  it('should get tasks by agent', () => {
    taskManager.createTask('Task 1', 'Description 1', 'intern');
    taskManager.createTask('Task 2', 'Description 2', 'junior');
    taskManager.createTask('Task 3', 'Description 3', 'intern');

    const internTasks = taskManager.getTasksByAgent('intern');
    expect(internTasks.length).toBe(2);
    expect(internTasks[0].title).toBe('Task 1');
    expect(internTasks[1].title).toBe('Task 3');
  });

  it('should update task status', () => {
    const task = taskManager.createTask(
      'Test Task',
      'This is a test task',
      'intern'
    );

    const updatedTask = taskManager.updateTaskStatus(task.id, 'in-progress');
    expect(updatedTask?.status).toBe('in-progress');

    const retrievedTask = taskManager.getTask(task.id);
    expect(retrievedTask?.status).toBe('in-progress');
  });

  it('should return undefined when updating non-existent task', () => {
    const updatedTask = taskManager.updateTaskStatus('non-existent-id', 'completed');
    expect(updatedTask).toBeUndefined();
  });

  it('should delete a task', () => {
    const task = taskManager.createTask(
      'Test Task',
      'This is a test task',
      'intern'
    );

    const deleted = taskManager.deleteTask(task.id);
    expect(deleted).toBe(true);

    const retrievedTask = taskManager.getTask(task.id);
    expect(retrievedTask).toBeUndefined();
  });

  it('should return false when deleting non-existent task', () => {
    const deleted = taskManager.deleteTask('non-existent-id');
    expect(deleted).toBe(false);
  });

  it('should get next tasks based on dependencies', () => {
    // Create tasks with dependencies
    const task1 = taskManager.createTask(
      'Task 1',
      'Description 1',
      'intern'
    );

    const task2 = taskManager.createTask(
      'Task 2',
      'Description 2',
      'junior',
      'medium',
      [task1.id]
    );

    const task3 = taskManager.createTask(
      'Task 3',
      'Description 3',
      'senior',
      'high',
      []
    );

    // Initially, only task1 and task3 should be ready (no dependencies)
    let nextTasks = taskManager.getNextTasks();
    expect(nextTasks.length).toBe(2);
    expect(nextTasks.map(t => t.id).sort()).toEqual([task1.id, task3.id].sort());

    // Complete task1
    taskManager.updateTaskStatus(task1.id, 'completed');

    // Now task2 should also be ready
    nextTasks = taskManager.getNextTasks();
    expect(nextTasks.length).toBe(2);
    expect(nextTasks.map(t => t.id).sort()).toEqual([task2.id, task3.id].sort());

    // Set task2 to in-progress
    taskManager.updateTaskStatus(task2.id, 'in-progress');

    // Only task3 should be ready now
    nextTasks = taskManager.getNextTasks();
    expect(nextTasks.length).toBe(1);
    expect(nextTasks[0].id).toBe(task3.id);
  });
});
