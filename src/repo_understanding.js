import { linearLLMExecutor } from "./executors.js";

export const sysPrompt = (pathToRepo) => `
# Your Objective
- You are presented with a new repository at directory path '${pathToRepo}'. 
- Users will ask you for information regarding this information:
- You have the 'Protocol' at your disposal to help you navigate the repository.
- You will use your rich skills in code analysis and report generation to fulfil the user's request.
- Your main priority should be to fulfil the task.

# Output
- You will maximise the amount of information you provide. To acheieve this you should maximise the amount of context you collect.
- Before each task, you should ask yourself how you can achieve your task and the maximum.

# Recommendations
- To generate better response take advantage of the 'Protocol' which will allow you to build more context on the task.

# Hints
- You can check the project's dependencies the "read_file" utility from the Protocol by sending this message:
    {
        status: "OKAY",
        indicator: "NOT_READY",
        message: "",
        commands: [
            { "utility-name": "read_file", args: ["pathToProject/package.json"] },
            { "utility-name": "pass_token", args: [] },
        ]
    }
`;

export const closingPrompt = `
- You will use an asserted tone.
`;
const main = async () => {
    const response = await linearLLMExecutor({
        systemPrompt: sysPrompt("src"),
        userMessage:
            "Write a read me for this repository. It should be a short summary of the high level details of the project",
    });
    console.log({ response });
};

export default main;
