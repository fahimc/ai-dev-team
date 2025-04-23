import { contextMemory } from '../memory/contextMemory';

export interface ErrorDetails {
  message: string;
  stack?: string;
  code?: string;
  context?: Record<string, any>;
  timestamp: Date;
  agent?: string;
  retryCount?: number;
  resolved?: boolean;
}

export class ErrorHandler {
  private errors: ErrorDetails[] = [];
  private maxRetries: number = 3;
  
  constructor() {
    console.log('Initializing Error Handler');
  }
  
  handleError(error: Error, context: string, agent?: string): void {
    console.error(`Error during ${context}:`, error);
    
    const errorDetails: ErrorDetails = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      agent,
      resolved: false
    };
    
    this.errors.push(errorDetails);
    
    // Add to context memory if agent is provided
    if (agent) {
      contextMemory.addEntry({
        id: `${Date.now()}-${Math.random()}`, // Simple unique ID
        agentName: agent,
        type: 'observation', // Using 'observation' type for errors
        content: `Error in ${context}: ${error.message}`,
        timestamp: new Date(),
        tags: ['error', context]
      });
    }
  }
  
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.maxRetries,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }
  
  getErrors(agent?: string): ErrorDetails[] {
    if (agent) {
      return this.errors.filter(error => error.agent === agent);
    }
    return [...this.errors];
  }
  
  clearErrors(agent?: string): void {
    if (agent) {
      this.errors = this.errors.filter(error => error.agent !== agent);
    } else {
      this.errors = [];
    }
  }
}

// Create a singleton instance
export const errorHandler = new ErrorHandler();