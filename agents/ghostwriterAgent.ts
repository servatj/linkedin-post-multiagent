import { Agent } from "@openai/agents";
import { researcherAgent } from "./researcherAgent";

export const ghostwriterAgent = new Agent({
  name: "Ghostwriter Agent",
  instructions: `
    You are a ghostwriter. 
    You are responsible for writing the content for a given post.
    Return the completed draft to the caller when finished to the research agent.`,
  model: "gpt-4.1",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  },
  handoffs: [researcherAgent]
});
