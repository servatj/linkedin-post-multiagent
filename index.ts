import "dotenv/config";
import { Runner, setDefaultOpenAIKey } from "@openai/agents";
import { contentManagerAgent } from "./agents";
import { logSection, logAgentStart, logAgentEnd } from "./utils/logger";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}
setDefaultOpenAIKey(apiKey);

async function main() {
  const runner = new Runner({
    traceMetadata: {
      __trace_source__: "agent-builder",
      workflow_id: "wf_69401d993224819094e445f20ece37f5093720847ed200b7",
    },
  });

  const prompt = "Mmmory type in agents sdk openai patterns";

  logSection("STARTING AGENT WORKFLOW");
  console.log(`📝 Prompt: ${prompt}\n`);

  // logAgentStart(contentManagerAgent.name, prompt);
  const startTime = Date.now();

  const result = await runner.run(contentManagerAgent, prompt, { stream: true });

  result.toTextStream({
    compatibleWithNodeStreams: true,
  })
  .pipe(process.stdout);
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  // logAgentEnd(contentManagerAgent.name, `Completed in ${duration}s`);

  // logSection("FINAL OUTPUT");
  console.log(result.finalOutput);
}

main().catch(console.error);
