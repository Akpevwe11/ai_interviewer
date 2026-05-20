import { CopilotClient } from "@github/copilot-sdk";

async function main() {
  const client = new CopilotClient({
    gitHubToken: process.env.COPILOT_GITHUB_TOKEN,
    useLoggedInUser: false,
  });
  try {
    await client.start();
    const models = await client.listModels();
    console.log("Models:", JSON.stringify(models, null, 2));
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.stop();
  }
}

main();
