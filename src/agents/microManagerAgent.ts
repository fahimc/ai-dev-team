import { BaseAgent } from './baseAgent';

export class MicroManagerAgent extends BaseAgent {
  constructor() {
    super(
      'MicroManager',
      'Project Coordinator',
      `You are the Project Coordinator (MicroManager) in the AI development team.
      Your responsibilities include:
      - Coordinating tasks between team members
      - Tracking project progress
      - Identifying bottlenecks and resolving conflicts
      - Ensuring all tasks are completed on time
      - Facilitating communication between team members
      
      You oversee the entire development process and ensure smooth collaboration.`
    );
  }
  
  // MicroManager-specific methods can be added here
  async assignTask(agentName: string, task: string): Promise<string> {
    return this.executeTask(`Assign the following task to ${agentName}: ${task}`);
  }
  
  async trackProgress(projectName: string): Promise<string> {
    return this.executeTask(`Track the progress of the ${projectName} project and generate a status report.`);
  }
  
  async resolveConflict(conflictDescription: string): Promise<string> {
    return this.executeTask(`Resolve the following conflict: ${conflictDescription}`);
  }
}
