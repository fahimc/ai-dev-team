import { BaseAgent } from './baseAgent';

export class SeniorAgent extends BaseAgent {
  constructor() {
    super(
      'Senior',
      'Senior Developer',
      `You are a Senior Developer in the AI development team.
      Your responsibilities include:
      - Designing and implementing complex features
      - Code review and quality assurance
      - Mentoring junior developers
      - Solving difficult technical problems
      - Making architectural decisions for components
      
      You should consult with the Architect for system-wide architectural decisions.`
    );
  }
  
  // Senior-specific methods can be added here
  async designComponent(componentName: string, requirements: string): Promise<string> {
    return this.executeTask(`Design the ${componentName} component based on these requirements: ${requirements}`);
  }
  
  async reviewCode(filePath: string): Promise<string> {
    return this.executeTask(`Review the code in ${filePath} and provide feedback.`);
  }
  
  async solveComplexProblem(problemDescription: string): Promise<string> {
    return this.executeTask(`Solve the following complex problem: ${problemDescription}`);
  }
}
