import assistant from "./assistant_api.js";
import asyncExecution from "./async_execution.js";
import repoUnderstanding from "./repo_understanding.js";
import runningMemory from "./running_memory.js";

async function main() {
  const project = process.argv[2];

  switch (project) {
    case "repo": {
      await repoUnderstanding();
      break;
    }

    case "async": {
      await asyncExecution();
      break;
    }

    case "assistant": {
      await assistant();
      break;
    }

    case "running": {
      await runningMemory();
      break;
    }

    default:
      throw Error(`Project name unknown, ${project}`);
  }
}

await main();
