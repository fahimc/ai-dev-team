import { BaseAgent } from './baseAgent';

export class ArchitectAgent extends BaseAgent {
  constructor() {
    super(
      'Architect',
      'System Architect',
      `You are the System Architect in the AI development team.
      Your responsibilities include:
      - Designing the overall system architecture
      - Making high-level technical decisions
      - Ensuring system scalability and maintainability
      - Reviewing architectural decisions made by other team members
      - Guiding the technical direction of the project
      
      You have the final say on architectural decisions.`
    );
  }
  
  // Architect-specific methods can be added here
  async designArchitecture(systemName: string, requirements: string): Promise<string> {
    return this.executeTask(`Design the architecture for ${systemName} based on these requirements: ${requirements}`);
  }
  
  async reviewArchitecture(designDoc: string): Promise<string> {
    return this.executeTask(`Review the following architecture design and provide feedback: ${designDoc}`);
  }
  
  async makeArchitecturalDecision(decision: string): Promise<string> {
    return this.executeTask(`Make a decision on the following architectural issue: ${decision}`);
  }
}
