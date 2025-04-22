import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

export class ExecRunner {
  private logDir: string = 'logs';
  private maxRetries: number = 3;
  
  constructor() {
    // Ensure log directory exists
    this.ensureLogDir();
  }
  
  private async ensureLogDir(): Promise<void> {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
      console.log(`Log directory created: ${this.logDir}`);
    } catch (error) {
      console.error(`Error creating log directory: ${error}`);
    }
  }
  
  async executeCommand(command: string, retryCount = 0): Promise<string> {
    console.log(`Executing command: ${command}`);
    
    try {
      // Execute the command
      const { stdout, stderr } = await execPromise(command);
      
      // Log the execution
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const logFile = path.join(this.logDir, `command-${timestamp}.log`);
      
      await fs.writeFile(logFile, `
Command: ${command}
Timestamp: ${new Date().toISOString()}
Output:
${stdout}
Error (if any):
${stderr}
      `);
      
      // If there's stderr output but the command didn't throw an error,
      // we still want to log it but not treat it as an error
      if (stderr) {
        console.warn(`Command produced stderr output: ${stderr}`);
      }
      
      return stdout;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error executing command: ${errorMessage}`);
      
      // Log the error
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const errorLogFile = path.join(this.logDir, `error-${timestamp}.log`);
      
      await fs.writeFile(errorLogFile, `
Command: ${command}
Timestamp: ${new Date().toISOString()}
Error:
${errorMessage}
      `);
      
      // Retry logic
      if (retryCount < this.maxRetries) {
        console.log(`Retrying command (${retryCount + 1}/${this.maxRetries}): ${command}`);
        return this.executeCommand(command, retryCount + 1);
      }
      
      throw new Error(`Command failed after ${this.maxRetries} retries: ${errorMessage}`);
    }
  }
  
  async writeFile(filePath: string, content: string, retryCount = 0): Promise<void> {
    console.log(`Writing to file: ${filePath}`);
    
    try {
      // Ensure the directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      // Write the file
      await fs.writeFile(filePath, content);
      
      // Log the file write
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const logFile = path.join(this.logDir, `file-write-${timestamp}.log`);
      
      await fs.writeFile(logFile, `
File: ${filePath}
Timestamp: ${new Date().toISOString()}
Action: Write
Size: ${content.length} bytes
      `);
      
      console.log(`Successfully wrote to ${filePath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error writing file: ${errorMessage}`);
      
      // Log the error
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const errorLogFile = path.join(this.logDir, `error-${timestamp}.log`);
      
      await fs.writeFile(errorLogFile, `
File: ${filePath}
Timestamp: ${new Date().toISOString()}
Action: Write
Error:
${errorMessage}
      `);
      
      // Retry logic
      if (retryCount < this.maxRetries) {
        console.log(`Retrying file write (${retryCount + 1}/${this.maxRetries}): ${filePath}`);
        return this.writeFile(filePath, content, retryCount + 1);
      }
      
      throw new Error(`File write failed after ${this.maxRetries} retries: ${errorMessage}`);
    }
  }
  
  async readFile(filePath: string, retryCount = 0): Promise<string> {
    console.log(`Reading file: ${filePath}`);
    
    try {
      // Read the file
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Log the file read
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const logFile = path.join(this.logDir, `file-read-${timestamp}.log`);
      
      await fs.writeFile(logFile, `
File: ${filePath}
Timestamp: ${new Date().toISOString()}
Action: Read
Size: ${content.length} bytes
      `);
      
      return content;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error reading file: ${errorMessage}`);
      
      // Log the error
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const errorLogFile = path.join(this.logDir, `error-${timestamp}.log`);
      
      await fs.writeFile(errorLogFile, `
File: ${filePath}
Timestamp: ${new Date().toISOString()}
Action: Read
Error:
${errorMessage}
      `);
      
      // Retry logic
      if (retryCount < this.maxRetries) {
        console.log(`Retrying file read (${retryCount + 1}/${this.maxRetries}): ${filePath}`);
        return this.readFile(filePath, retryCount + 1);
      }
      
      throw new Error(`File read failed after ${this.maxRetries} retries: ${errorMessage}`);
    }
  }
  
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  async listFiles(dirPath: string): Promise<string[]> {
    console.log(`Listing files in directory: ${dirPath}`);
    
    try {
      const files = await fs.readdir(dirPath);
      return files;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error listing files: ${errorMessage}`);
      return [];
    }
  }
  
  async deleteFile(filePath: string): Promise<void> {
    console.log(`Deleting file: ${filePath}`);
    
    try {
      await fs.unlink(filePath);
      
      // Log the file deletion
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const logFile = path.join(this.logDir, `file-delete-${timestamp}.log`);
      
      await fs.writeFile(logFile, `
File: ${filePath}
Timestamp: ${new Date().toISOString()}
Action: Delete
      `);
      
      console.log(`Successfully deleted ${filePath}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error deleting file: ${errorMessage}`);
      
      // Log the error
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const errorLogFile = path.join(this.logDir, `error-${timestamp}.log`);
      
      await fs.writeFile(errorLogFile, `
File: ${filePath}
Timestamp: ${new Date().toISOString()}
Action: Delete
Error:
${errorMessage}
      `);
      
      throw error;
    }
  }
}

// Create a singleton instance
export const execRunner = new ExecRunner();
