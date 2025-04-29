import repoUnderstanding from "./repo_understanding.js";
import asyncExecution from "./async_execution.js";
import assistant from "./assistant_api.js";

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

    default:
      throw Error(`Project name unknown, ${project}`);
  }
}

await main();
