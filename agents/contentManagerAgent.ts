import { Agent, Runner, tool } from "@openai/agents";
import { z } from "zod";
import { writeFileTool, createPostWithImageTool } from "../tools";
import { researcherAgent } from "./researcherAgent";
import { logAgentStart, logAgentEnd, logToolCall } from "../utils/logger";

// Wrap researcher agent with logging
const loggedResearcherTool = tool({
  name: "research_and_create_post",
  description: "Research a topic and create a complete post with content and image. Pass the topic and requirements.",
  parameters: z.object({
    input: z.string().describe("The topic to research and create content about"),
  }),
  execute: async ({ input }: { input: string }) => {
    logAgentStart(researcherAgent.name, input);
    const startTime = Date.now();

    const runner = new Runner();
    const result = await runner.run(researcherAgent, input);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const output = typeof result.finalOutput === "string"
      ? result.finalOutput
      : JSON.stringify(result.finalOutput);

    logAgentEnd(researcherAgent.name, `[${duration}s] ${output}`);
    return result.finalOutput;
  },
});

// Wrap create post with image tool
const loggedCreatePostTool = tool({
  name: "create_post_file",
  description: "Create a complete post file with content and image references. Extract the post content and image details from the researcher's output. Use empty strings for imageUrl and imageFilePath if not available.",
  parameters: z.object({
    postContent: z.string().describe("The main post content/text"),
    imageUrl: z.string().describe("The URL of the generated image (use empty string '' if none)"),
    imageFilePath: z.string().describe("The local file path where the image is saved (use empty string '' if none)"),
    outputPath: z.string().describe("Where to save the post (e.g., './posts/linkedin-post.md')"),
  }),
  execute: async (params: any) => {
    logToolCall("create_post_file", { outputPath: params.outputPath });
    return (createPostWithImageTool as any).execute(params);
  },
});

// Wrap write file tool with logging (fallback)
const loggedWriteFileTool = tool({
  name: "write_file",
  description: "Write plain content to a file (use create_post_file for posts with images)",
  parameters: z.object({
    path: z.string().describe("File path to write to"),
    content: z.string().describe("Content to write"),
  }),
  execute: async ({ path, content }: { path: string; content: string }) => {
    logToolCall("write_file", { path, contentLength: content.length });
    return (writeFileTool as any).execute({ path, content });
  },
});

export const contentManagerAgent = new Agent({
  name: "Content Manager Agent",
  instructions: `You are a content manager and orchestrator. Your job is to:
    1. Analyze the user's concept/topic
    2. Use the researcher tool to research, write, create images, and review the content
    3. Once you receive the final post with image details, use create_post_file to save it properly
    
    The researcher will coordinate with:
    - Ghostwriter for writing content
    - Image creator for generating and downloading images
    - Quality reviewer for ensuring quality
    
    IMPORTANT: When saving the post, use create_post_file and provide ALL required parameters:
    - postContent: The full text content
    - imageUrl: The DALL-E image URL (or empty string '' if no image)
    - imageFilePath: The local file path (or empty string '' if no image)  
    - outputPath: Where to save (e.g., './posts/linkedin-ai-agents.md')
    
    Save to an appropriate filename like './posts/linkedin-ai-agents.md'`,
  model: "gpt-4o",

  tools: [loggedResearcherTool, loggedCreatePostTool, loggedWriteFileTool],
});
