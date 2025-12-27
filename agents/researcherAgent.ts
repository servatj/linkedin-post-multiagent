import { Agent, webSearchTool, tool } from "@openai/agents";
import { z } from "zod";
import { ghostwriterAgent } from "./ghostwriterAgent";
import { imageCreatorAgent } from "./imageCreatorAgent";
import { qualityReviewerAgent } from "./qualityReviewerAgent";
import { logAgentStart, logAgentEnd, logToolCall } from "../utils/logger";

// Wrap agent.asTool() with logging
function createLoggedAgentTool(
  agent: Agent,
  config: { toolName: string; toolDescription: string }
) {
  return tool({
    name: config.toolName,
    description: config.toolDescription,
    parameters: z.object({
      input: z.string().describe("he input/request for the aTgent"),
    }),
    execute: async ({ input }: { input: string }) => {
      logAgentStart(agent.name, input);
      const startTime = Date.now();

      // Call the original agent
      const { Runner } = await import("@openai/agents");
      const runner = new Runner();
      const result = await runner.run(agent, input);

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      const output = typeof result.finalOutput === "string" 
        ? result.finalOutput 
        : JSON.stringify(result.finalOutput);
      
      logAgentEnd(agent.name, `[${duration}s] ${output}`);
      return result.finalOutput;
    },
  });
}

// Create a logged web search tool
const loggedWebSearch = (() => {
  const originalTool = webSearchTool();
  return tool({
    name: "web_search",
    description: "Search the web for information",
    parameters: z.object({
      query: z.string().describe("The search query"),
    }),
    execute: async ({ query }: { query: string }) => {
      logToolCall("web_search", query);
      // Use the original tool's execute
      return (originalTool as any).execute({ query });
    },
  });
})();

export const researcherAgent = new Agent({
  name: "Researcher Agent",
  instructions: `You are a researcher and content coordinator. Your job is to:
    1. Research the given topic using web search
    2. Use the ghostwriter to write the content based on your research
    3. Use the image creator to generate a relevant image for the post (it will automatically download it)
    4. Use the quality reviewer to review the content
    5. Iterate based on quality feedback if needed
    6. Return the final polished post with BOTH:
       - The complete post content
       - The image details (URL and local file path)
    
    IMPORTANT: Make sure your final response clearly includes:
    - The full post text
    - The image URL from DALL-E
    - The local file path where the image was saved
    
    Coordinate all agents to produce a complete, high-quality post with image.`,
  model: "gpt-4o",
  tools: [
    loggedWebSearch,
    createLoggedAgentTool(ghostwriterAgent, {
      toolName: "write_content",
      toolDescription: "Use the ghostwriter to write engaging content based on research findings. Pass the research and requirements as input.",
    }),
    createLoggedAgentTool(imageCreatorAgent, {
      toolName: "create_image",
      toolDescription: "Generate an image for the post. Describe what kind of image you need.",
    }),
    createLoggedAgentTool(qualityReviewerAgent, {
      toolName: "review_quality",
      toolDescription: "Review the content quality and get feedback for improvements. Pass the content to review.",
    }),
  ],
});
