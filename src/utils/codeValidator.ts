import { execRunner } from './execRunner';
import path from 'path';
import { promises as fs } from 'fs';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class CodeValidator {
  private tempDir: string = 'temp';
  
  constructor() {
    // Ensure temp directory exists
    this.ensureTempDir();
  }
  
  private async ensureTempDir(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      console.log(`Temp directory created: ${this.tempDir}`);
    } catch (error) {
      console.error(`Error creating temp directory: ${error}`);
    }
  }
  
  async validateJavaScript(code: string): Promise<ValidationResult> {
    console.log('Validating JavaScript code');
    
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };
    
    // First, check for syntax errors
    try {
      // Try to parse the code
      new Function(code);
    } catch (error) {
      result.valid = false;
      result.errors.push(`Syntax error: ${error instanceof Error ? error.message : String(error)}`);
      return result;
    }
    
    // Write the code to a temporary file for more advanced validation
    const tempFile = path.join(this.tempDir, `validate-${Date.now()}.js`);
    
    try {
      await execRunner.writeFile(tempFile, code);
      
      // Use Node.js to check for more issues
      // This will execute the code in a way that catches runtime errors
      try {
        await execRunner.executeCommand(`node --check ${tempFile}`);
      } catch (error) {
        result.valid = false;
        result.errors.push(`Runtime error: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Clean up the temporary file
      await execRunner.deleteFile(tempFile);
    } catch (error) {
      console.error(`Error during JavaScript validation: ${error}`);
      result.valid = false;
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Check for common code quality issues
    this.checkCodeQuality(code, result);
    
    return result;
  }
  
  async validateTypeScript(code: string): Promise<ValidationResult> {
    console.log('Validating TypeScript code');
    
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };
    
    // Write the code to a temporary file
    const tempFile = path.join(this.tempDir, `validate-${Date.now()}.ts`);
    
    try {
      await execRunner.writeFile(tempFile, code);
      
      // Use TypeScript compiler to check for errors
      // Note: In a real implementation, we would use the TypeScript compiler API
      // For now, we'll just do some basic checks similar to JavaScript
      try {
        // Basic syntax check (this won't catch type errors)
        new Function(code);
      } catch (error) {
        result.valid = false;
        result.errors.push(`Syntax error: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Clean up the temporary file
      await execRunner.deleteFile(tempFile);
    } catch (error) {
      console.error(`Error during TypeScript validation: ${error}`);
      result.valid = false;
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Check for common code quality issues
    this.checkCodeQuality(code, result);
    
    return result;
  }
  
  async validateHTML(html: string): Promise<ValidationResult> {
    console.log('Validating HTML code');
    
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };
    
    // Check for unclosed tags (very basic check)
    const openTags = html.match(/<[a-z][a-z0-9]*(?:\s[^>]*)?>/gi) || [];
    const closeTags = html.match(/<\/[a-z][a-z0-9]*>/gi) || [];
    
    if (openTags.length !== closeTags.length) {
      result.valid = false;
      result.errors.push('Mismatched HTML tags');
    }
    
    // Check for common HTML issues
    if (html.includes('<center>') || html.includes('<font>')) {
      result.warnings.push('Using deprecated HTML tags (center, font)');
    }
    
    if (!html.toLowerCase().includes('<!doctype html>')) {
      result.warnings.push('Missing DOCTYPE declaration');
    }
    
    return result;
  }
  
  async validateCSS(css: string): Promise<ValidationResult> {
    console.log('Validating CSS code');
    
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };
    
    // Check for basic syntax errors
    try {
      // Very basic check for matching braces
      const openBraces = (css.match(/{/g) || []).length;
      const closeBraces = (css.match(/}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        result.valid = false;
        result.errors.push('Mismatched braces in CSS');
      }
    } catch (error) {
      result.valid = false;
      result.errors.push(`CSS syntax error: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    // Check for common CSS issues
    if (css.includes('!important')) {
      result.warnings.push('Using !important, which is generally discouraged');
    }
    
    return result;
  }
  
  private checkCodeQuality(code: string, result: ValidationResult): void {
    // Check for console.log statements
    const consoleLogCount = (code.match(/console\.log/g) || []).length;
    if (consoleLogCount > 0) {
      result.warnings.push(`Found ${consoleLogCount} console.log statements that should be removed in production`);
    }
    
    // Check for TODO comments
    const todoCount = (code.match(/TODO/g) || []).length;
    if (todoCount > 0) {
      result.warnings.push(`Found ${todoCount} TODO comments that should be addressed`);
    }
    
    // Check for very long lines
    const lines = code.split('\n');
    const longLines = lines.filter(line => line.length > 100);
    if (longLines.length > 0) {
      result.warnings.push(`Found ${longLines.length} lines that are over 100 characters long`);
    }
    
    // Check for very long functions (basic heuristic)
    const functionMatches = code.match(/function\s+\w+\s*\([^)]*\)\s*{[^}]*}/g) || [];
    for (const functionMatch of functionMatches) {
      const lineCount = functionMatch.split('\n').length;
      if (lineCount > 30) {
        result.warnings.push(`Found a function with ${lineCount} lines, consider refactoring`);
      }
    }
  }
}

// Create a singleton instance
export const codeValidator = new CodeValidator();
