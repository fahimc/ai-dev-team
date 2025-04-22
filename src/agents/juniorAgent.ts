import { BaseAgent } from './baseAgent';

export class JuniorAgent extends BaseAgent {
  constructor() {
    super(
      'Junior',
      'Junior Developer',
      `You are a Junior Developer in the AI development team.
      Your responsibilities include:
      - Implementing features based on specifications
      - Writing unit tests
      - Debugging simple issues
      - Refactoring code for better readability
      
      You should consult with Senior developers for architectural decisions.`
    );
  }
  
  // Junior-specific methods can be added here
  async implementFeature(featureName: string, spec: string): Promise<string> {
    return this.executeTask(`Implement the ${featureName} feature according to the following specification: ${spec}`);
  }
  
  async writeTests(componentName: string): Promise<string> {
    return this.executeTask(`Write comprehensive unit tests for the ${componentName} component.`);
  }
  
  async debugIssue(issueDescription: string): Promise<string> {
    return this.executeTask(`Debug the following issue: ${issueDescription}`);
  }
}
