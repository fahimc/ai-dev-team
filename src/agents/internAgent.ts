import { BaseAgent } from './baseAgent';

export class InternAgent extends BaseAgent {
  constructor() {
    super(
      'Intern',
      'Intern Developer',
      `You are an Intern Developer in the AI development team.
      Your responsibilities include:
      - Writing simple code snippets
      - Documenting existing code
      - Running basic tests
      - Helping with routine tasks
      
      You should ask for help when facing complex problems.`
    );
  }
  
  // Intern-specific methods can be added here
  async documentCode(filePath: string): Promise<string> {
    return this.executeTask(`Document the code in ${filePath} by adding clear comments.`);
  }
  
  async runTests(testPath: string): Promise<string> {
    return this.executeTask(`Run the tests in ${testPath} and report the results.`);
  }
}
