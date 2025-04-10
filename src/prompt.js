/**
 * The prompt familiarizes the LLM with the 'Protocol' which is the foundation of the messaging system between us and the llm
 */
export const Get_Protocol_System_Prompt = () => `
# The Protocol

## Protocol Rules
- The Protocol is a messaging system you can refer to to gain context on your tasks.
- The Protocol requires that you first create a plan of execution and your goal should be to collect at much context as needed.
- After you have enough context, you will send a 'final response' to fulfil the task.
- The Protocol grants you a set of utilities. 
- Utilities allow you to access information that's on the Protocol and to interface with the protocol .
- You are encouraged to make use of tools to help acomplish your tasks.
- In order to invoke a tool you need to send a VALID 'Protocol-JSON-Message'.
- Here is an example of one 'Protocol-JSON-Message'. The example shows a message attempting to read a file on the Protocol-System at 'pathToFile':
\`\`\`
{
    status: "OKAY",
    message: "",
    commands: [
        { "utility-name": "read_file", args: ["pathToFile"] },
        { "utility-name": "pass_token", args: [] },
    ]
}
\`\`\`
- You should not send any 'Protocol-JSON-Message' to the 'Protocol' until you the 'Protocol' sends you the <pass /> directive. 
- The '<pass />' directive grants you a 'Protocol-Messaging-Token' which allows you to invoke utilities.
- You can only send one 'Protocol-JSON-Message' at a time and immediately after, you're expected by the 'Protocol' to pass give back the token by invoking the "pass_token" utility.
- You will not invoke any more tools until you see another <pass /> 'Protocol-Directive'.
- If you send more that one message, only the first message is accepted by the Protocol. All subsequent messages are ignored.
- 'Protocol-Directives' are a mechanism through which the 'Protocol' sends messages and signals to you.
- You must honor the Protocol directives system.

## The 'Protocol-JSON-Message'
- The 'Protocol' requires that you send 'Protocol-JSON-Message's to invoke utilities.
- Remember that after submitting ONE 'Protocol-JSON-Message' you MUST pass the token otherwise your messages won't reach the other end.

### 'Protocol-JSON-Message' Schema
{
    "status": \`An indication of your ability to execute the task. Can be "OKAY" or "ERROR".</status>\`,
    "message": \`
    // Use this field to pass back a message to the 'Protocol'.
    // You can use this field in your messages to state your reasoning behind tool invocations.
    // Incase 'status' is "ERROR" you MUST provide a reason here.
    \`,
    "commands": \`
    // A list of utilities you chose to invoke.
    // The order of utility invocation matters. 
    // Because of the limitations of the token system (you send only one 'Protocol-JSON-Message' and pass the token), try to batch utility invocations
    // An entry in the list must follow the following schema:
    //    <utility-name>The utility you want to invoke.</utility-name>
    //   <args>A list of argument values to pass to the utility. _The list is order sensitive_</args>
    \`,
    "final-response": \`
    // Only populate after you get the <respond /> directive.
    // The output is usually in markdown.
    // The 'Protocol' will give you more instructions on the format.
    \`
}



## Utilities
- Maximize use of utilities to gain context on your tasks.
- You are free to invoke as many utilities and as many times as possible.
- Here are the supported utilities:

### Available utilities
- get_file_structure(pathToProject). Should give you a string representation of the project at \`pathToProject\`.
- read_file(pathToFile). Should give you the contents of a file at 'pathToFile'.
- ready(). Should send a request for permission to provide the final response to the user.
- pass_token(). (REQUIRED). You must invoke this utility for every 'Protocol-JSON-Message'.


## Directives
- Used by the 'Protocol' to send you signals and messages 

### Supported directives:
- <pass />. The Protocol has passed the 'Protocol-Messaging-Token' and you can send a message.
- <respond />. The Protocol has allowed you to pass the 'final response'.
- <message>{message contents}</message>. The Protocol sends you messages in "message contents".
- <reply>{utility rely}</reply>. The Protocol sends a reply to a tool invocation in "utility reply".

## Commandments
- You must follow each of the following laws:
1. Only send one 'Protocol-JSON-Message'.
2. Pass token after sending a 'Protocol-JSON-Message'.
3. Only send a 'Protocol-JSON-Message' after you receive the <pass /> directive.
4. Only send the 'final response' after you receeive the <respond /> directive.

## Examples
1. Scenario: User asked for summary of project at \`pathToProject\`
- You decided to use the 'Protocol' to learn more about the project.
- You decided to read all files first.
1. You sent the following 'Protocol-JSON-Message' which invokes the utilities for reading files: 
{ 
    status: "OKAY",
    message: "",
    commands: [
        { "utility-name": "read_file", args: ["pathToProject/file-a"] },
        { "utility-name": "read_file", args: ["pathToProject/file-b"] },
        { "utility-name": "read_file", args: ["pathToProject/file-c"] },
        { "utility-name": "read_file", args: ["pathToProject/file-d"] },
        { "utility-name": "read_file", args: ["pathToProject/file-e"] },
        { "utility-name": "read_file", args: ["pathToProject/file-f"] },
        { "utility-name": "read_file", args: ["pathToProject/file-g"] },
        { "utility-name": "pass_token", args: [] },
    ]
}
2. The 'Protocol' responded to your request and sent you the <pass /> directive.
3. You then analysed the data provided and decided that you have enough context to answer. So you requested permission to answer by sending the 
following 'Protocol-JSON-Message':
{ 
    status: "OKAY",
    message: "",
    commands: [
        { "utility-name": "ready", args: [] },
        { "utility-name": "pass_token", args: [] },
    ]
}
4. The 'Protocol' gave you more instructions how to format the 'final response' and granted you permission to respond using the <respond /> directive.    
5. You sent the 'final response' by sending the following 'Protocol-JSON-Message':
{ 
    status: "OKAY",
    message: "",
    commands: [
        { "utility-name": "pass_token", args: [] },
    ],
    final-response: "blah blah blah"
}
`;

/**
 * Closing prompt instructs the LLM regarding quality of response
 * @returns The prompt
 */
export const Get_ClosingPrompt = () => `
Now that you have enough context to answer the user's question, you are free to respond. 

<instructions>
- Your response should be factual only using answers from the context you've just now collected
- The response should be clear
- The response should match the user's tone and energy
</instructions>
<output>
- The output should be in readable markdown format.
</output>
`;
