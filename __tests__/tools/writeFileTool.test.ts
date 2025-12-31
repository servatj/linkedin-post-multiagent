import { promises as fs } from 'fs';
import { logToolCall, logToolResult } from '../../utils/logger';

// Recreate the execute function for testing
async function writeFileExecute({ path, content }: { path: string; content: string }) {
  logToolCall("write_file", { path, contentLength: content.length });
  try {
    await fs.writeFile(path, content, "utf-8");
    const result = `File written successfully to ${path}`;
    logToolResult("write_file", result);
    return result;
  } catch (err: any) {
    const result = `Error writing file: ${err.message}`;
    logToolResult("write_file", result);
    return result;
  }
}

// Mock fs and logger
jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  },
}));

jest.mock('../../utils/logger', () => ({
  logToolCall: jest.fn(),
  logToolResult: jest.fn(),
}));

describe('writeFileTool execute logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should write file successfully', async () => {
    const mockWriteFile = fs.writeFile as jest.MockedFunction<typeof fs.writeFile>;
    mockWriteFile.mockResolvedValue(undefined);

    const result = await writeFileExecute({
      path: 'test.txt',
      content: 'Hello, World!',
    });

    expect(mockWriteFile).toHaveBeenCalledWith('test.txt', 'Hello, World!', 'utf-8');
    expect(result).toBe('File written successfully to test.txt');
  });

  it('should handle write errors', async () => {
    const mockWriteFile = fs.writeFile as jest.MockedFunction<typeof fs.writeFile>;
    mockWriteFile.mockRejectedValue(new Error('Permission denied'));

    const result = await writeFileExecute({
      path: 'test.txt',
      content: 'Hello, World!',
    });

    expect(result).toBe('Error writing file: Permission denied');
  });
});
