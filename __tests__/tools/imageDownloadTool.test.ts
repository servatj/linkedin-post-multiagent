import { promises as fs } from 'fs';
import { logToolCall, logToolResult } from '../../utils/logger';

// Recreate the execute function for testing
async function imageDownloadExecute({
  imageUrl,
  filename,
  directory,
}: {
  imageUrl: string;
  filename: string;
  directory: string;
}): Promise<
  | { success: true; filePath: string; message: string }
  | { success: false; error: string }
> {
  const targetDir = directory && directory.trim() ? directory : "./images";
  logToolCall("download_image", { imageUrl: imageUrl.substring(0, 60) + "...", filename, directory: targetDir });

  try {
    await fs.mkdir(targetDir, { recursive: true });

    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const filePath = `${targetDir}/${filename}`;
    
    await fs.writeFile(filePath, Buffer.from(buffer));

    const result = {
      success: true as const,
      filePath,
      message: `Image downloaded and saved to ${filePath}`,
    };
    
    logToolResult("download_image", `SUCCESS: Saved to ${filePath}`);
    return result;
  } catch (err: any) {
    const result = {
      success: false as const,
      error: err.message,
    };
    logToolResult("download_image", `ERROR: ${err.message}`);
    return result;
  }
}

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

global.fetch = jest.fn();

describe('imageDownloadTool execute logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should download and save image successfully', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    const mockArrayBuffer = new ArrayBuffer(8);
    
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
    } as any);

    const mockMkdir = fs.mkdir as jest.MockedFunction<typeof fs.mkdir>;
    const mockWriteFile = fs.writeFile as jest.MockedFunction<typeof fs.writeFile>;
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const result = await imageDownloadExecute({
      imageUrl: 'https://example.com/image.png',
      filename: 'test.png',
      directory: './images',
    });

    expect(mockFetch).toHaveBeenCalledWith('https://example.com/image.png');
    expect(mockMkdir).toHaveBeenCalledWith('./images', { recursive: true });
    expect(mockWriteFile).toHaveBeenCalled();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.filePath).toBe('./images/test.png');
    }
  });

  it('should handle download failures', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as any);

    const mockMkdir = fs.mkdir as jest.MockedFunction<typeof fs.mkdir>;
    mockMkdir.mockResolvedValue(undefined);

    const result = await imageDownloadExecute({
      imageUrl: 'https://example.com/notfound.png',
      filename: 'test.png',
      directory: './images',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('404');
    }
  });

  it('should use default directory when empty string provided', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    const mockArrayBuffer = new ArrayBuffer(8);
    
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
    } as any);

    const mockMkdir = fs.mkdir as jest.MockedFunction<typeof fs.mkdir>;
    mockMkdir.mockResolvedValue(undefined);
    (fs.writeFile as jest.MockedFunction<typeof fs.writeFile>).mockResolvedValue(undefined);

    await imageDownloadExecute({
      imageUrl: 'https://example.com/image.png',
      filename: 'test.png',
      directory: '',
    });

    expect(mockMkdir).toHaveBeenCalledWith('./images', { recursive: true });
  });
});
