import { taskManager, Task } from './index';
import { getAgent, getAllAgents } from '../agents';

export class TaskScheduler {
  private running: boolean = false;
  private intervalId: number | null = null;
  
  constructor() {
    console.log('Initializing Task Scheduler');
  }
  
  start() {
    if (this.running) {
      console.log('Task Scheduler is already running');
      return;
    }
    
    console.log('Starting Task Scheduler');
    this.running = true;
    
    // Schedule tasks every 5 seconds
    this.intervalId = setInterval(() => {
      this.scheduleTasks();
    }, 5000) as unknown as number;
  }
  
  stop() {
    if (!this.running || this.intervalId === null) {
      console.log('Task Scheduler is not running');
      return;
    }
    
    console.log('Stopping Task Scheduler');
    clearInterval(this.intervalId);
    this.running = false;
    this.intervalId = null;
  }
  
  private async scheduleTasks() {
    console.log('Scheduling tasks...');
    
    // Get all tasks that are ready to be executed
    const nextTasks = taskManager.getNextTasks();
    
    if (nextTasks.length === 0) {
      console.log('No tasks to schedule');
      return;
    }
    
    console.log(`Found ${nextTasks.length} tasks to schedule`);
    
    // Process each task
    for (const task of nextTasks) {
      await this.processTask(task);
    }
  }
  
  private async processTask(task: Task) {
    console.log(`Processing task: ${task.title} (${task.id})`);
    
    // Update task status to in-progress
    taskManager.updateTaskStatus(task.id, 'in-progress');
    
    // Get the agent assigned to this task
    const agent = getAgent(task.assignedTo);
    
    if (!agent) {
      console.error(`Agent ${task.assignedTo} not found for task ${task.id}`);
      taskManager.updateTaskStatus(task.id, 'failed');
      return;
    }
    
    try {
      // Execute the task
      const result = await agent.executeTask(task.description);
      console.log(`Task ${task.id} completed with result: ${result}`);
      
      // Update task status to completed
      taskManager.updateTaskStatus(task.id, 'completed');
    } catch (error) {
      console.error(`Error executing task ${task.id}: ${error}`);
      
      // Update task status to failed
      taskManager.updateTaskStatus(task.id, 'failed');
    }
  }
}

// Create a singleton instance
export const taskScheduler = new TaskScheduler();
