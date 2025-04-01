/**
 * @param {string} pathToRepo
 * @returns
 */
const Get_Prompt = (pathToRepo) => `
<instructions>
- You're are presented with a new repository at directory path '${pathToRepo}'. 
- Your task is to generate documentation on the repository for someone who has never worked on the repository
- You're presented with a set of utilities that you can use to perform various operations like reading files, getting file structure etc
- All your responses **MUST** return in valid JSON format
</instructions>

<utilities>
get_file_structure(pathToProject). Execution should provide the project's file structure
read_file(pathToFile). Execution should give you the contents of a file at 'pathToFile'
ready(). Executing ready indicates you have enough context to achieve your task
</instructions>

<output>
Return a list of commands with the following format
    <output-format>
        - utility-name. The utility you want to invoke
        - args. A list of argument values to pass. **Order matters**
    </output-format>
</output>


<examples>
[You decided to read 2 files then signal you're ready. Your output should look like:]
\`\`\`
[
    { "utility-name": "read_file", args: ["file a"] },
    { "utility-name": "read_file", args: ["file c"] },
    { "utility-name": "ready" }
]
\`\`\`
</examples>
`;

export default Get_Prompt;
