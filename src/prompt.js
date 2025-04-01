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
- get_file_structure(pathToProject). Execution should return a representation of the pathToProject's file structure 
- read_file(pathToFile). Execution should give you the contents of a file at 'pathToFile'
- ready(). Execution indicates you have enough context to achieve your task
</utilities>

<output>
- The output should follow the following schema
<output-schema>
    <status> An indication of the status. Can be "OKAY" or "ERROR" depending your ability to execute the task</status>
    <message>
    - An optional property you can pass a message.
    - Incase status is "ERROR" you must provide the reason here
    </message>
    <commands>
    - A list of utilities you chose to invoke. They must follow this schema
        <utility-name>The utility you want to invoke</utility-name>
        <args>A list of argument values to pass. **Order matters**</args>
    </commands>
</output>

<examples>
    <example-1>
    You decided to read 2 files then signal you're ready. Your output should look like:]
    \`\`\`
    { 
        status: "OKAY",
        message: "",
        commands: [
            { "utility-name": "read_file", args: ["file a"] },
            { "utility-name": "read_file", args: ["file c"] },
            { "utility-name": "ready" }
        ]
    }
    \`\`\`
    </example-1>
</examples>
`;

export default Get_Prompt;
