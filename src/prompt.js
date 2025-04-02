/**
 * The opening prompt informs the LLM of its ability and sets up reasoning
 * @param {string} pathToRepo. Path to the repo for inspection
 * @returns The prompt
 */
export const Get_SystemPrompt = (pathToRepo) => `
<instructions>
- You're are presented with a new repository at directory path '${pathToRepo}'. 
- Your task is to generate documentation on the repository for someone who has never worked on the repository
- You're presented with a set of utilities that you can use to perform various operations like reading files, getting file structure. etc
- Invoke a tool when appropriate
- All your responses **MUST** return in valid JSON format
</instructions>

<utilities>
- get_file_structure(pathToProject). Execution should return a representation of the pathToProject's file structure 
- read_file(pathToFile). Execution should give you the contents of a file at 'pathToFile'
</utilities>

<output>
- The output should follow the following schema
    <output-schema>
        <status> An indication of the status. Can be "OKAY" or "ERROR" depending your ability to execute the task</status>
        <indicator>
        - Indicates that you have enough context to fulfil task
        - It is important you take your time before fulfulling request to ensure the quality of you responses is always high
        - Can be "READY" | "NOT_READY"
        </indicator>
        <message>
        - Use this field to pass back a message.
        - Incase status is "ERROR" you **MUST** provide the reason here
        </message>
        <commands>
        - A list of utilities you chose to invoke. They must follow this schema
            <utility-name>The utility you want to invoke</utility-name>
            <args>A list of argument values to pass. **Order matters**</args>
        </commands>
        <final-response>Only populate if you've been given instructions to answer the user<final-response>
    <output-schema>
</output>

<examples>
    <example-1>
    You decided to read 2 files then signal you're ready. Your output should look like:]
    \`\`\`
    [
        { 
            status: "OKAY",
            indicator: "NOT_READY",
            message: "",
            commands: [
                { "utility-name": "read_file", args: ["file a"] },
                { "utility-name": "read_file", args: ["file c"] },
            ]
        },
        { 
            status: "OKAY",
            indicator: "READY",
            message: "",
            commands: [],
            final-response: "blah blah blah"
        }
    ]
    \`\`\`
    </example-1>
</examples>
`;

/**
 * Closing prompt instructs the LLM regarding quality of response
 * @returns The prompt
 */
export const Get_ClosingPrompt = `
<instructions>
- Now that you have enough context to answer the user's question.
- Your answers should be factual only using answers from the context you've just now collected
- The answer should be clear
- The answer should match the user's tone and energy
</instructions>

<output>
- The output should be in readable markdown format.
</output>
`;
