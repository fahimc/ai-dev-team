
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
  
  handle