import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FileManager } from '../../src/utils/fileManager';
import { promises as fs } from 'fs';
import path from 'path';

// Mock the fs module
vi.mock('fs', () => ({
  promises: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn(),
    access: vi.fn(),
    readdir: vi.fn(),
    unlink: vi.fn(),
  },
}));

describe('FileManager', () => {
  let fileManager: FileManager;
  const testDir = 'test_files';
  const testFilePath = path.join(testDir, 'test.txt');

  beforeEach(() => {
    fileManager = new FileManager();
    // Reset mocks before each test
    vi.mocked(fs.mkdir).mockReset();
    vi.mocked(fs.writeFile).mockReset();
    vi.mocked(fs.readFile).mockReset();
    vi.mocked(fs.access).mockReset();
    vi.mocked(fs.readdir).mockReset();
    vi.mocked(fs.unlink).mockReset();

    // Default mock implementations
    vi.mocked(fs.mkdir).mockResolvedValue(undefined);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
    vi.mocked(fs.readFile).mockResolvedValue('file content');
    vi.mocked(fs.access).mockResolvedValue(undefined); // Assume file exists by default
    vi.mocked(fs.readdir).mockResolvedValue(['file1.js', 'file2.js'] as any);
    vi.mocked(fs.unlink).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a file and its directory if it does not exist', async () => {
    // Mock access to throw to simulate file not existing
    vi.mocked(fs.access).mockRejectedValue(new Error('File not found'));

    await fileManager.createFile(testFilePath, 'initial content', 'TestAgent');

    expect(fs.mkdir).toHaveBeenCalledWith(path.join('codebase', testDir), { recursive: true });
    expect(fs.writeFile).toHaveBeenCalledWith(path.join('codebase', testFilePath), 'initial content');
  });

  it('should update an existing file', async () => {
    await fileManager.updateFile(testFilePath, 'updated content', 'TestAgent');

    expect(fs.access).toHaveBeenCalledWith(path.join('codebase', testFilePath)); // Check if file exists
    expect(fs.writeFile).toHaveBeenCalledWith(path.join('codebase', testFilePath), 'updated content');
  });

  it('should read content from a file', async () => {
    const content = await fileManager.readFile(testFilePath, 'TestAgent');

    expect(fs.readFile).toHaveBeenCalledWith(path.join('codebase', testFilePath), 'utf-8');
    expect(content).toBe('file content');
  });

  it('should list files in a directory', async () => {
    const files = await fileManager.listFiles(testDir);

    expect(fs.readdir).toHaveBeenCalledWith(path.join('codebase', testDir));
    expect(files).toEqual(['file1.js', 'file2.js']);
  });

  it('should delete a file', async () => {
    await fileManager.deleteFile(testFilePath, 'TestAgent');

    expect(fs.unlink).toHaveBeenCalledWith(path.join('codebase', testFilePath));
  });

  it('should throw an error when updating a non-existent file', async () => {
    // Mock access to throw to simulate file not existing
    vi.mocked(fs.access).mockRejectedValue(new Error('File not found'));

    const result = await fileManager.updateFile(testFilePath, 'updated content', 'TestAgent');
    expect(result).toBe(false);
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should throw an error when reading a non-existent file', async () => {
    // Mock readFile to throw to simulate file not existing
    vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));

    const content = await fileManager.readFile(testFilePath, 'TestAgent');
    expect(content).toBeNull();
  });

  it('should throw an error when deleting a non-existent file', async () => {
    // Mock unlink to throw to simulate file not existing
    vi.mocked(fs.unlink).mockRejectedValue(new Error('File not found'));

    const result = await fileManager.deleteFile(testFilePath, 'TestAgent');
    expect(result).toBe(false);
  });
});