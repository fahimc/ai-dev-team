import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { DynamicTool } from '@langchain/core/tools';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { StringOutputParser } from '@langchain/core/output_parsers';

export interface AgentMemory {
  tasks: string[];
  executionHistory: string[];
  contextualMemory: Record<string, any>;
}

export class BaseAgent {
  name: string;
  role: string;
  description: string;
  memory: AgentMemory;
  model: ChatOpenAI;
  executor: AgentExecutor | null = null;
  
  constructor(name: string, role: string, description: string) {
    this.name = name;
    this.role = role;
    this.description = description;
    this.memory = {
      tasks: [],
      executionHistory: [],
      contextualMemory: {},
    };
    
    // Initialize the model (using a placeholder API key - this should be set properly in a real environment)
    this.model = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.2,
      openAIApiKey: 'placeholder-api-key',
    });
  }
  
  initialize() {
    console.log(`Initializing ${this.role} agent: ${this.name}`);
    
    // Define tools that this agent can use
    const tools = [
      new DynamicTool({
        name: 'writeFile',
        description: 'Write content to a file',
        func: async (input: string) => {
          const [filePath, content] = input.split('|||');
          console.log(`Writing to file: ${filePath}`);
          // In a real implementation, this would use fs.writeFileSync
          return `Successfully wrote to ${filePath}`;
        },
      }),
      new DynamicTool({
        name: 'readFile',
        description: 'Read content from a file',
        func: async (input: string) => {
          console.log(`Reading file: ${input}`);
          // In a real implementation, this would use fs.readFileSync
          return `Content of ${input}`;
        },
      }),
      new DynamicTool({
        name: 'executeCommand',
        description: 'Execute a shell command',
        func: async (input: string) => {
          console.log(`Executing command: ${input}`);
          // In a real implementation, this would use child_process.execSync
          return `Result of executing: ${input}`;
        },
      }),
    ];
    
    // Create the agent prompt
    const prompt = PromptTemplate.fromTemplate(`
      You are ${this.name}, a ${this.role} in an AI development team.
      ${this.description}
      
      Current tasks:
      ${this.memory.tasks.join('\n')}
      
      Previous actions:
      ${this.memory.executionHistory.join('\n')}
      
      Use the tools available to you to complete your tasks.
      
      {input}
    `);
    
    // Create a chain for the agent
    const chain = RunnableSequence.from([
      prompt,
      this.model,
      new StringOutputParser(),
    ]);
    
    // Create the agent
    const agent = createReactAgent({
      llm: this.model,
      tools,
      prompt, // Add the prompt here
    });
    
    // Create the agent executor
    this.executor = AgentExecutor.fromAgentAndTools({
      agent,
      tools,
      verbose: true,
    });
  }
  
  async executeTask(task: string): Promise<string> {
    if (!this.executor) {
      throw new Error(`Agent ${this.name} not initialized`);
    }
    
    console.log(`${this.role} ${this.name} executing task: ${task}`);
    
    // Add the task to the memory
    this.memory.tasks.push(task);
    
    try {
      // Execute the task
      const result = await this.executor.invoke({ input: task });
      
      // Add the result to the execution history
      this.memory.executionHistory.push(`Task: ${task}\nResult: ${result.output}`);
      
      return result.output;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error executing task: ${errorMessage}`);
      
      // Add the error to the execution history
      this.memory.executionHistory.push(`Task: ${task}\nError: ${errorMessage}`);
      
      return `Error: ${errorMessage}`;
    }
  }
  
  addTask(task: string) {
    this.memory.tasks.push(task);
    console.log(`Added task to ${this.name}: ${task}`);
  }
  
  clearTasks() {
    this.memory.tasks = [];
    console.log(`Cleared tasks for ${this.name}`);
  }

  addToContextualMemory(key: string, value: any) {
    this.memory.contextualMemory[key] = value;
    console.log(`Added to contextual memory for ${this.name}: ${key}`);
  }

  getFromContextualMemory(key: string): any {
    return this.memory.contextualMemory[key];
  }

  getRecentHistory(n: number): string[] {
    return this.memory.executionHistory.slice(-n);
  }
}
