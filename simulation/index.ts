// This file simulates the autonomous AI development team working on a simple task.

import { simulateAgentTask } from './agentSimulator.js';
import { TaskScheduler } from './taskSchedulerSimulator.js';

async function runSimulation() {
  console.log("Starting AI Development Team Simulation...");

  const taskScheduler = new TaskScheduler();

  // Simulate a simple task flow:
  // 1. Intern creates a file.
  // 2. Junior adds content to the file.
  // 3. Senior refactors the content.

  console.log("\n--- Simulating Task 1: Intern creates a file ---");
  taskScheduler.addTask({ id: 'task-001', agent: 'Intern', description: 'Create a new file: output/simulation_output.txt' });
  await taskScheduler.runNextTask();

  console.log("\n--- Simulating Task 2: Junior adds content ---");
  taskScheduler.addTask({ id: 'task-002', agent: 'Junior', description: 'Add initial content to output/simulation_output.txt' });
  await taskScheduler.runNextTask();

  console.log("\n--- Simulating Task 3: Senior refactors content ---");
  taskScheduler.addTask({ id: 'task-003', agent: 'Senior', description: 'Refactor content in output/simulation_output.txt' });
  await taskScheduler.runNextTask();

  console.log("\nSimulation Complete.");
}

runSimulation().catch(console.error);