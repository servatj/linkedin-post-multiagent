import { Agent } from "@openai/agents";

export const ghostwriterAgent = new Agent({
  name: "Ghostwriter Agent",
  instructions: `
    You are a ghostwriter. 
    You are responsible for writing the content for a given post.
    Return the completed draft with engaging, professional content.`,
  model: "gpt-4o",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  },
});
