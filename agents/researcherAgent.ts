import { Agent, webSearchTool } from "@openai/agents";
import { ghostwriterAgent } from "./ghostwriterAgent";
import { imageCreatorAgent } from "./imageCreatorAgent";
import { qualityReviewerAgent } from "./qualityReviewerAgent";
import { contentManagerAgent } from "./contentManagerAgent";

export const researcherAgent: Agent = new Agent({
  name: "Researcher Agent",
  instructions: `You are a researcher and a post coordinator manager that can use the handoffs to deliver the research to the ghostwriter, image creator, quality reviewer, and content manager. 
    You are responsible for researching the content for a given post.
    put all the post together and deliver the final post to the conntent manager after quality review agent approved.
    You will use the handoffs to deliver the research to the ghostwriter, image creator, and quality reviewer. Deliver to content manger the final result`,
  handoffs: [ghostwriterAgent, imageCreatorAgent, qualityReviewerAgent, contentManagerAgent], 
  model: "gpt-4.1",
  tools: [webSearchTool()],
});
