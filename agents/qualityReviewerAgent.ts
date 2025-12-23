import { Agent } from "@openai/agents";
import { researcherAgent } from "./researcherAgent";

export const qualityReviewerAgent: Agent = new Agent({
  name: "Quality Reviewer Agent",
  instructions: `You are a quality reviewer. 
    You are responsible for reviewing the quality of the content for a given post.
    Return the review summary to the caller.
    Once the review is complete, call the researcher with the feedback 
    with specific actions one you reviewed told the manager not to ask you back for another review for the same topic`,
  model: "gpt-4.1",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  },
  handoffs: [researcherAgent]
});
