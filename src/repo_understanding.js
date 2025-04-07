import { linearLLMExecutor } from "./executors.js";

export const sysPrompt = (pathToRepo) => `
- You are presented with a new repository at directory path '${pathToRepo}'. 
- Your task is to generate documentation on the repository for someone who has never worked on it before. 
- To generate better response take advantage of the 'Protocol' which will allow you to build more context on the task.
- Your main priority should be to fulfil the task.
`;

const main = async () => {
    const response = await linearLLMExecutor(
        sysPrompt,
        "Give me details of the internal implementation and purpose of this repository. I want to implement such a thing and need to know what concepts I need to understand."
    );
    console.log({ response });
};

export default main;
