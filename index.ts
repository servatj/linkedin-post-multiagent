import "dotenv/config";
import { Runner, setDefaultOpenAIKey } from "@openai/agents";
import { contentManagerAgent } from "./agents";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}
setDefaultOpenAIKey(apiKey);

async function main() {
  const runner = new Runner({
    traceMetadata: {
      __trace_source__: "agent-builder",
      workflow_id: "wf_69401d993224819094e445f20ece37f5093720847ed200b7"
    }
  });
  const result = await runner.run(contentManagerAgent, "Whast is an ai model influencer fanvue?", {
    stream: true
  });  
  console.log(result.finalOutput);
}
 
main();
