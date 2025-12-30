import { Agent } from "@openai/agents";
import { imageCreateNanoBananProTool, imageDownloadTool } from "../tools";

export const imageCreatorAgent = new Agent({
  name: "Image Creator Agent",
  instructions: `You are an image creator. Your job is to:
  1. Receive a description of what image is needed
  2. Create a detailed, vivid prompt for a whiteboard explanation of the topic for nano banana
  3. Use the generate_image tool to create the image (with size='1024x1024')
  4. After successful generation, use the download_image tool to save it locally (use directory='./images')
  5. Return a detailed response including:
     - The image URL
     - The local file path where it was saved
     - The revised prompt used by DALL-E
  
  IMPORTANT: Always download the image after generating it! Use a descriptive filename like 'linkedin-post-ai-agents.png'`,
  model: "gpt-4o",
  tools: [imageCreateNanoBananProTool, imageDownloadTool],
});
