
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ExecRunner } from '../../src/utils/execRunner';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import path from 'path';

// Mock dependencies
vi.mock('fs', () => ({
  promises: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
    access: vi.fn(),
    readdir: vi.fn(),
    unlink: vi.fn()
  }
}));

vi.mock('child_process', () => ({
  exec: vi.fn()
}));

vi.mock('util', () => ({
  promisify: vi.fn().mockImplementation((fn) => fn)
}));

describe('ExecRunner', () => {
  let execRunner: ExecRunner;
  
  beforeEach(() => {
    execRunner = new ExecRunner();
    
    // Reset mocks
    vi.mocked(fs.mkdir).mockReset();
    vi.mocked(fs.writeFile).mockReset();
    vi.mocked(fs.readFile).mockReset();
    vi.mocked(fs.access).mockReset();
    vi.mocked(fs.readdir).mockReset();
    vi.mocked(fs.unlink).mockReset();
    vi.mocked(exec).mockReset();
    
    // Default mock implementations
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue('file content');
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readdir).mockResolvedValue(['file1.js', 'file2.js']);
    vi.mocked(fs.unlink).mockResolvedValue(undefined);
    vi.mocked(exec).mockImplementation((cmd, callback) => {
      callback(null, { stdout: 'command output', stderr: '' });
      return {} as any;
    });
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  it('should create log directory on initialization', async () => {
    // Check that mkdir was called
    expect(fs.mkdir).toHaveBeenCalledWith('logs', { recursive: true });
  });
  
  it('should execute commands and log the output', async () => {
    const result = await execRunner.executeCommand('echo "test"');
    
    // Check that exec was called
    expect(exec).toHaveBeenCalledWith('echo "test"');
    
    // Check that the result is correct
    expect(result).toBe('command output');
    
    // Check that the execution was logged
    expect(fs.writeFile).toHaveBeenCalled();
    const logCall = vi.mocked(fs.writeFile).mock.calls[0];
    expect(logCall[0]).toContain('command-');
    expect(logCall[1]).toContain('Command: echo "test"');
    expect(logCall[1]).toContain('Output:');
    expect(logCall[1]).toContain('command output');
  });