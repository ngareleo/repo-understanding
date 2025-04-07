import repoUnderstanding from "./repo_understanding.js";
import asyncExecution from "./async_execution.js";

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

        default:
            throw Error(`Project name unknown, ${project}`);
    }
}

await main();
