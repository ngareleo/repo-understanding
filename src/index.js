import assistant from "./assistant_api.js";
import asyncExecution from "./async_execution.js";
import repoUnderstanding from "./repo_understanding.js";
import runningMemory from "./running_memory.js";
import thinkPlanExecuteExecution from "./think_plan_execute.js";

async function main() {
  const project = process.argv[2];
  const { v1: repoUnderstandingV1, v2: repoUnderstandingV2 } =
    await repoUnderstanding();

  switch (project) {
    case "repo": {
      await repoUnderstandingV1();
      break;
    }

    case "repoV2": {
      await repoUnderstandingV2();
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

    case "think": {
      await thinkPlanExecuteExecution();
      break;
    }

    default:
      throw Error(`Project name unknown, ${project}`);
  }
}

await main();
