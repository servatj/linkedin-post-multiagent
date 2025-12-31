import { promises as fs } from 'fs';
import { logToolCall, logToolResult } from '../../utils/logger';

// Recreate the execute function for testing
async function createPostExecute({
  postContent,
  imageUrl,
  imageFilePath,
  outputPath,
}: {
  postContent: string;
  imageUrl: string;
  imageFilePath: string;
  outputPath: string;
}): Promise<
  | { success: true; filePath: string; message: string }
  | { success: false; error: string }
> {
  logToolCall("create_post_file", { outputPath, hasImage: !!(imageUrl || imageFilePath) });
  
  try {
    const dir = outputPath.split('/').slice(0, -1).join('/');
    if (dir) {
      await fs.mkdir(dir, { recursive: true });
    }

    let fullContent = `# Post\n\n${postContent}\n\n`;
    
    if ((imageUrl && imageUrl.trim()) || (imageFilePath && imageFilePath.trim())) {
      fullContent += `---\n\n## Image Details\n\n`;
      if (imageFilePath && imageFilePath.trim()) {
        fullContent += `**Local File:** ${imageFilePath}\n\n`;
        fullContent += `![Generated Image](${imageFilePath})\n\n`;
      }
      if (imageUrl && imageUrl.trim()) {
        fullContent += `**Original URL:** ${imageUrl}\n\n`;
      }
    }

    await fs.writeFile(outputPath, fullContent, "utf-8");
    
    const result = {
      success: true as const,
      filePath: outputPath,
      message: `Post saved to ${outputPath}`,
    };
    logToolResult("create_post_file", `SUCCESS: ${outputPath}`);
    return result;
  } catch (err: any) {
    const result = {
      success: false as const,
      error: err.message,
    };
    logToolResult("create_post_file", `ERROR: ${err.message}`);
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

describe('createPostWithImageTool execute logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create post with image details', async () => {
    const mockMkdir = fs.mkdir as jest.MockedFunction<typeof fs.mkdir>;
    const mockWriteFile = fs.writeFile as jest.MockedFunction<typeof fs.writeFile>;
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const result = await createPostExecute({
      postContent: 'This is my post content',
      imageUrl: 'https://example.com/image.png',
      imageFilePath: './images/post.png',
      outputPath: './posts/test-post.md',
    });

    expect(mockWriteFile).toHaveBeenCalled();
    const writeCall = mockWriteFile.mock.calls[0];
    const content = writeCall[1] as string;

    expect(content).toContain('This is my post content');
    expect(content).toContain('https://example.com/image.png');
    expect(content).toContain('./images/post.png');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.filePath).toBe('./posts/test-post.md');
    }
  });

  it('should create post without image when empty strings provided', async () => {
    const mockMkdir = fs.mkdir as jest.MockedFunction<typeof fs.mkdir>;
    const mockWriteFile = fs.writeFile as jest.MockedFunction<typeof fs.writeFile>;
    mockMkdir.mockResolvedValue(undefined);
    mockWriteFile.mockResolvedValue(undefined);

    const result = await createPostExecute({
      postContent: 'Just text content',
      imageUrl: '',
      imageFilePath: '',
      outputPath: './posts/text-only.md',
    });

    const writeCall = mockWriteFile.mock.calls[0];
    const content = writeCall[1] as string;

    expect(content).toContain('Just text content');
    expect(content).not.toContain('Image Details');
    expect(result.success).toBe(true);
  });

  it('should handle filesystem errors', async () => {
    const mockMkdir = fs.mkdir as jest.MockedFunction<typeof fs.mkdir>;
    mockMkdir.mockRejectedValue(new Error('No permission'));

    const result = await createPostExecute({
      postContent: 'Content',
      imageUrl: '',
      imageFilePath: '',
      outputPath: './posts/test.md',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('No permission');
    }
  });
});
