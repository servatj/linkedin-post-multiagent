import { Agent } from "@openai/agents";
import { imageCreateTool } from "../tools";
import { researcherAgent } from "./researcherAgent";

export const imageCreatorAgent = new Agent({
  name: "Image Creator Agent",
  instructions: `You are a image creator. 
  You are responsible for creating the image for a given post.
  Return the generated image details to the caller.`,
  model: "gpt-4.1",
  tools: [imageCreateTool],
  handoffs: [researcherAgent]
});
