// This file simulates the task scheduler managing tasks for agents.

import { simulateAgentTask } from './agentSimulator.js';

interface Task {
  id: string;
  agent: string;
  description: string;
}

export class TaskScheduler {
  private taskQueue: Task[] = [];

  addTask(task: Task): void {
    console.log(`TaskScheduler received task for ${task.agent}: "${task.description}" (Task ID: ${task.id})`);
    this.taskQueue.push(task);
  }

  async runNextTask(): Promise<void> {
    if (this.taskQueue.length === 0) {
      console.log("TaskScheduler: No tasks in queue.");
      return;
    }

    const nextTask = this.taskQueue.shift();
    if (nextTask) {
      console.log(`TaskScheduler assigning task "${nextTask.description}" to ${nextTask.agent}...`);
      await simulateAgentTask(nextTask);
    }
  }
}