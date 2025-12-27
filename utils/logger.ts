// Simple logger with colored output and timestamps
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const agentColors: Record<string, string> = {
  "Content Manager Agent": colors.magenta,
  "Researcher Agent": colors.cyan,
  "Ghostwriter Agent": colors.green,
  "Image Creator Agent": colors.yellow,
  "Quality Reviewer Agent": colors.blue,
};

function timestamp(): string {
  return new Date().toISOString().split("T")[1].slice(0, 12);
}

export function logAgentStart(agentName: string, input: string) {
  const color = agentColors[agentName] || colors.white;
  console.log(
    `\n${colors.dim}[${timestamp()}]${colors.reset} ${color}${colors.bright}🤖 ${agentName}${colors.reset}`
  );
  console.log(`${colors.dim}   ├─ Input: ${input.substring(0, 100)}${input.length > 100 ? "..." : ""}${colors.reset}`);
}

export function logAgentEnd(agentName: string, output: string) {
  const color = agentColors[agentName] || colors.white;
  console.log(
    `${colors.dim}[${timestamp()}]${colors.reset} ${color}✅ ${agentName} completed${colors.reset}`
  );
  const truncated = output.substring(0, 150);
  console.log(`${colors.dim}   └─ Output: ${truncated}${output.length > 150 ? "..." : ""}${colors.reset}`);
}

export function logToolCall(toolName: string, input: unknown) {
  console.log(
    `${colors.dim}[${timestamp()}]${colors.reset} ${colors.yellow}🔧 Tool: ${toolName}${colors.reset}`
  );
  const inputStr = typeof input === "string" ? input : JSON.stringify(input, null, 2);
  if (inputStr.length < 200) {
    console.log(`${colors.dim}   └─ ${inputStr}${colors.reset}`);
  }
}

export function logToolResult(toolName: string, output: unknown) {
  const outputStr = typeof output === "string" ? output : JSON.stringify(output);
  console.log(
    `${colors.dim}[${timestamp()}] ✅ ${toolName} result: ${outputStr.substring(0, 100)}${outputStr.length > 100 ? "..." : ""}${colors.reset}`
  );
}

export function logError(message: string, error?: unknown) {
  console.error(`${colors.red}❌ Error: ${message}${colors.reset}`, error || "");
}

export function logSection(title: string) {
  console.log(`\n${colors.bright}${"═".repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}  ${title}${colors.reset}`);
  console.log(`${colors.bright}${"═".repeat(60)}${colors.reset}\n`);
}
