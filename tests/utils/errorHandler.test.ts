import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorHandler } from '../../src/utils/errorHandler';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;
  
  beforeEach(() => {
    errorHandler = new ErrorHandler();
    vi.useFakeTimers(); // Use fake timers for testing retries with delays
  });

  afterEach(() => {
    vi.useRealTimers(); // Restore real timers
    vi.clearAllMocks();
  });

  it('should execute an operation successfully on the first attempt', async () => {
    const mockOperation = vi.fn().mockResolvedValue('Success');
    const result = await errorHandler.retryOperation(mockOperation, 3, 100);

    expect(mockOperation).toHaveBeenCalledTimes(1);
    expect(result).toBe('Success');
  });

  it('should retry an operation a specified number of times before failing', async () => {
    const mockOperation = vi.fn()
      .mockRejectedValueOnce(new Error('Attempt 1 failed'))
      .mockRejectedValueOnce(new Error('Attempt 2 failed'))
      .mockRejectedValueOnce(new Error('Attempt 3 failed'));

    await expect(errorHandler.retryOperation(mockOperation, 3, 100)).rejects.toThrow('Attempt 3 failed');
    expect(mockOperation).toHaveBeenCalledTimes(3);
    // Advance timers to ensure retries are attempted during the operation
    await vi.advanceTimersByTimeAsync(100); // Advance for the first retry delay
    await vi.advanceTimersByTimeAsync(100); // Advance for the second retry delay
  });

  it('should succeed on a retry attempt', async () => {
    const mockOperation = vi.fn()
      .mockRejectedValueOnce(new Error('Attempt 1 failed'))
      .mockResolvedValueOnce('Success on attempt 2');

    const result = await errorHandler.retryOperation(mockOperation, 3, 100);

    expect(mockOperation).toHaveBeenCalledTimes(2);
    expect(result).toBe('Success on attempt 2');
    // Advance timers to ensure the first retry is attempted during the operation
    await vi.advanceTimersByTimeAsync(100); // Advance for the first retry delay
  });

  it('should use the specified delay between retries', async () => {
    const mockOperation = vi.fn()
      .mockRejectedValueOnce(new Error('Attempt 1 failed'))
      .mockRejectedValueOnce(new Error('Attempt 2 failed'))
      .mockResolvedValueOnce('Success on attempt 3');

    const delay = 200;
    const startTime = Date.now();
    const result = await errorHandler.retryOperation(mockOperation, 3, delay);
    const endTime = Date.now();

    expect(mockOperation).toHaveBeenCalledTimes(3);
    expect(result).toBe('Success on attempt 3');
    // Advance timers to ensure retries are attempted with the correct delay during the operation
    await vi.advanceTimersByTimeAsync(delay); // Advance for the first retry delay
    await vi.advanceTimersByTimeAsync(delay); // Advance for the second retry delay
  });

  it('should handle errors with the handleError method', () => {
    const mockError = new Error('Something went wrong');
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler.handleError(mockError, 'Task execution');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error during Task execution:', mockError);
    consoleErrorSpy.mockRestore();
  });
});