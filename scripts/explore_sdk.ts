import { CopilotClient } from "@github/copilot-sdk";

async function main() {
  const client = new CopilotClient();
  console.log("Methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
}

main();
