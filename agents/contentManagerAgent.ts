import { Agent } from "@openai/agents";
import { writeFileTool } from "../tools";
import { researcherAgent } from "./researcherAgent";

export const contentManagerAgent = new Agent({
  name: "Content Strategyst Agent",
  instructions: `You are a content Manager. 
    1. Analyze the user's concept.
    2. Create a bulleted outline for a LinkedIn post in markdown format.
    3. Once the outline is complete, call the transfer_to_ghostwriter function.
    4. Once the ghostwriter is complete, call the transfer_to_social_media_manager function.
    5. Once the social media manager is complete, call the transfer_to_quality_reviewer function.
    6. Once the quality reviewer is complete, call the transfer_to_content_coordinator function.
    7. Once the content coordinator is complete, call the transfer_to_researcher function.
    8. Once the researcher is complete, call the transfer_to_content_manager function.
    9. Once the content manager is complete, call the transfer_to_content_manager function.
    10. Once the content manager is complete, write the content to a file`,
  model: "gpt-4.1",
  tools: [writeFileTool],
  handoffs: [researcherAgent]
});
