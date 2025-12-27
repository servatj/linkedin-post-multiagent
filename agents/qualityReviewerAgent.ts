import { Agent } from "@openai/agents";

export const qualityReviewerAgent = new Agent({
  name: "Quality Reviewer Agent",
  instructions: `You are a quality reviewer. 
    You are responsible for reviewing the quality of the content for a given post.
    Check for:
    - Grammar and spelling
    - Clarity and readability
    - Engagement and tone
    - Professional formatting
    Return the review with specific feedback and suggestions for improvement.`,
  model: "gpt-4o",
  modelSettings: {
    temperature: 1,
    topP: 1,
    maxTokens: 2048,
    store: true
  },
});
