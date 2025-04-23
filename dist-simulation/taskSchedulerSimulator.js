// This file simulates the task scheduler managing tasks for agents.
import { simulateAgentTask } from './agentSimulator.js';
export class TaskScheduler {
    taskQueue = [];
    addTask(task) {
        console.log(`TaskScheduler received task for ${task.agent}: "${task.description}" (Task ID: ${task.id})`);
        this.taskQueue.push(task);
    }
    async runNextTask() {
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
