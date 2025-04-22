import { promises as fs } from 'fs';
import path from 'path';
import { execRunner } from './execRunner';
import { codeValidator } from './codeValidator';
import { contextMemory } from '../memory/contextMemory';

export interface FileOperation {
  type: 'create' | 'update' | 'delete' | 'read';
  path: string;
  content?: string;
  timestamp: Date;
  agent: string;
}

export class FileManager {
  private codebaseDir: string = 'codebase';
  private operationsLog: FileOperation[] = [];
  
  constructor() {
    // Ensure codebase directory exists
    this.ensureCodebaseDir();
  }
  
  private async ensureCodebaseDir(): Promise<void> {
    try {
      await fs.mkdir(this.codebaseDir, { recursive: true });
      console.log(`Codebase directory created: ${this.codebaseDir}`);
    } catch (error) {
      console.error(`Error creating codebase directory: ${error}`);
    }
  }
  
  async createFile(filePath: string, content: string, agent: string): Promise<boolean> {
    const fullPath = path.join(this.codebaseDir, filePath);
    console.log(`Creating file: ${fullPath}`);
    
    try {
      // Check if file already exists
      const exists = await execRunner.fileExists(fullPath);
      if (exists) {
        console.error(`File already exists: ${fullPath}`);
        return false;
      }
      
      // Validate the content based on file extension
      const extension = path.extname(filePath).toLowerCase();
      let validationResult;
      
      switch (extension) {
        case '.js':
          validationResult = await codeValidator.validateJavaScript(content);
          break;
        case '.ts':
          validationResult = await codeValidator.validateTypeScript(content);
          break;
        case '.html':
          validationResult = await codeValidator.validateHTML(content);
          break;
        case '.css':
          validationResult = await codeValidator.validateCSS(content);
          break;
        default:
          // No validation for other file types
          validationResult = { valid: true, errors: [], warnings: [] };
      }
      
      // Log warnings but proceed
      if (validationResult.warnings.length > 0) {
        console.warn(`Warnings for ${filePath}:`, validationResult.warnings);
        
        // Add to context memory
        contextMemory.addMemory(
          agent,
          'observation',
          `Warnings when creating ${filePath}: ${validationResult.warnings.join(', ')}`,
          ['warning', 'validation', 'file-creation']
        );
      }
      
      // If there are errors, don't create the file
      if (!validationResult.valid) {
        console.error(`Validation errors for ${filePath}:`, validationResult.errors);
        
        // Add to context memory
        contextMemory.addMemory(
          agent,
          'error',
          `Validation errors when creating ${filePath}: ${validationResult.errors.join(', ')}`,
          ['error', 'validation', 'file-creation']
        );
        
        return false;
      }
      
      // Create the file
      await execRunner.writeFile(fullPath, content);
      
      // Log the operation
      const operation: FileOperation = {
        type: 'create',
        path: filePath,
        content,
        timestamp: new Date(),
        agent,
      };
      
      this.operationsLog.push(operation);
      
      // Add to context memory
      contextMemory.addMemory(
        agent,
        'task',
        `Created file: ${filePath}`,
        ['file-creation']
      );
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error creating file: ${errorMessage}`);
      
      // Add to context memory
      contextMemory.addMemory(
        agent,
        'error',
        `Error creating file ${filePath}: ${errorMessage}`,
        ['error', 'file-creation']
      );
      
      return false;
    }
  }
  
  async updateFile(filePath: string, content: string, agent: string): Promise<boolean> {
    const fullPath = path.join(this.codebaseDir, filePath);
    console.log(`Updating file: ${fullPath}`);
    
    try {
      // Check if file exists
      const exists = await execRunner.fileExists(fullPath);
      if (!exists) {
        console.error(`File does not exist: ${fullPath}`);
        return false;
      }
      
      // Read the current content
      const currentContent = await execRunner.readFile(fullPath);
      
      // Skip update if content is the same
      if (currentContent === content) {
        console.log(`File content unchanged: ${fullPath}`);
        return true;
      }
      
      // Validate the content based on file extension
      const extension = path.extname(filePath).toLowerCase();
      let validationResult;
      
      switch (extension) {
        case '.js':
          validationResult = await codeValidator.validateJavaScript(content);
          break;
        case '.ts':
          validationResult = await codeValidator.validateTypeScript(content);
          break;
        case '.html':
          validationResult = await codeValidator.validateHTML(content);
          break;
        case '.css':
          validationResult = await codeValidator.validateCSS(content);
          break;
        default:
          // No validation for other file types
          validationResult = { valid: true, errors: [], warnings: [] };
      }
      
      // Log warnings but proceed
      if (validationResult.warnings.length > 0) {
        console.warn(`Warnings for ${filePath}:`, validationResult.warnings);
        
        // Add to context memory
        contextMemory.addMemory(
          agent,
          'observation',
          `Warnings when updating ${filePath}: ${validationResult.warnings.join(', ')}`,
          ['warning', 'validation', 'file-update']
        );
      }
      
      // If there are errors, don't update the file
      if (!validationResult.valid) {
        console.error(`Validation errors for ${filePath}:`, validationResult.errors);
        
        // Add to context memory
        contextMemory.addMemory(
          agent,
          'error',
          `Validation errors when updating ${filePath}: ${validationResult.errors.join(', ')}`,
          ['error', 'validation', 'file-update']
        );
        
        return false;
      }
      
      // Update the file
      await execRunner.writeFile(fullPath, content);
      
      // Log the operation
      const operation: FileOperation = {
        type: 'update',
        path: filePath,
        content,
        timestamp: new Date(),
        agent,
      };
      
      this.operationsLog.push(operation);
      
      // Add to context memory
      contextMemory.addMemory(
        agent,
        'task',
        `Updated file: ${filePath}`,
        ['file-update']
      );
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error updating file: ${errorMessage}`);
      
      // Add to context memory
      contextMemory.addMemory(
        agent,
        'error',
        `Error updating file ${filePath}: ${errorMessage}`,
        ['error', 'file-update']
      );
      
      return false;
    }
  }
  
  async readFile(filePath: string, agent: string): Promise<string | null> {
    const fullPath = path.join(this.codebaseDir, filePath);
    console.log(`Reading file: ${fullPath}`);
    
    try {
      // Check if file exists
      const exists = await execRunner.fileExists(fullPath);
      if (!exists) {
        console.error(`File does not exist: ${fullPath}`);
        return null;
      }
      
      // Read the file
      const content = await execRunner.readFile(fullPath);
      
      // Log the operation
      const operation: FileOperation = {
        type: 'read',
        path: filePath,
        timestamp: new Date(),
        agent,
      };
      
      this.operationsLog.push(operation);
      
      return content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error reading file: ${errorMessage}`);
      
      // Add to context memory
      contextMemory.addMemory(
        agent,
        'error',
        `Error reading file ${filePath}: ${errorMessage}`,
        ['error', 'file-read']
      );
      
      return null;
    }
  }
  
  async deleteFile(filePath: string, agent: string): Promise<boolean> {
    const fullPath = path.join(this.codebaseDir, filePath);
    console.log(`Deleting file: ${fullPath}`);
    
    try {
      // Check if file exists
      const exists = await execRunner.fileExists(fullPath);
      if (!exists) {
        console.error(`File does not exist: ${fullPath}`);
        return false;
      }
      
      // Delete the file
      await execRunner.deleteFile(fullPath);
      
      // Log the operation
      const operation: FileOperation = {
        type: 'delete',
        path: filePath,
        timestamp: new Date(),
        agent,
      };
      
      this.operationsLog.push(operation);
      
      // Add to context memory
      contextMemory.addMemory(
        agent,
        'task',
        `Deleted file: ${filePath}`,
        ['file-deletion']
      );
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error deleting file: ${errorMessage}`);
      
      // Add to context memory
      contextMemory.addMemory(
        agent,
        'error',
        `Error deleting file ${filePath}: ${errorMessage}`,
        ['error', 'file-deletion']
      );
      
      return false;
    }
  }
  
  async listFiles(dirPath: string = ''): Promise<string[]> {
    const fullPath = path.join(this.codebaseDir, dirPath);
    console.log(`Listing files in directory: ${fullPath}`);
    
    try {
      const files = await execRunner.listFiles(fullPath);
      return files;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error listing files: ${errorMessage}`);
      return [];
    }
  }
  
  getRecentOperations(count: number = 10): FileOperation[] {
    return this.operationsLog
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, count);
  }
  
  getOperationsByAgent(agent: string): FileOperation[] {
    return this.operationsLog.filter(op => op.agent === agent);
  }
}

// Create a singleton instance
export const fileManager = new FileManager();
