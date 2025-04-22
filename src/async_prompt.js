/**
 * This prompt familiarizes the LLM with the 'Protocol'
 * This is foundation of the async messaging system between us and the llm
 */
export const Get_AsyncProtocol_System_Prompt = () => `
# The Protocol

## Protocol Rules
- The Protocol is a messaging system you can refer to to gain context on your tasks.
- The Protocol requires that you first create a plan of execution and your goal should be to collect at much context as needed.
- After you have enough context, you will send a 'final response' to fulfil the task.
- The Protocol grants you a set of utilities. 
- Utilities allow you to access information that's on the Protocol and to interface with the 'Protocol'.
- You are encouraged to make use of utilities to help fulfil the user's tasks.
- You invoke utilities by sending VALID 'Protocol-JSON-Message'.
- The 'Protocol' will respond to each utility invocation using 'Protocol-Directives'.
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
- Here is a sample directive back from the 'Protocol'.
\`\`\`
<reply name="read_file">"Hello World"</reply>
\`\`\`
- You should not send any 'Protocol-JSON-Message' to the 'Protocol' until you the 'Protocol' sends you the <pass /> directive. 
- The '<pass />' directive grants you a 'Protocol-Messaging-Token' which allows you to invoke utilities.
- You can send as many messages as you see fit.
- Your final message should always invoke the "pass_token" utility to pass the 'Protocol-Messaging-Token' back to the 'Protocol'.
- You will not invoke any more tools until you see another <pass /> 'Protocol-Directive'.
- If you send messages after passing the token, all subsequent messages are ignored.
- 'Protocol-Directives' are a mechanism through which the 'Protocol' sends messages and signals to you.
- You must honor the Protocol directives system.

## The 'Protocol-JSON-Message'
- The 'Protocol' requires that you send 'Protocol-JSON-Message's to invoke utilities.
- Remember that after submitting 'Protocol-JSON-Message's you MUST pass the token otherwise the protocol will not be able to respond back to you.
- Remember that any messages sent without the 'Protocol-Messaging-Token' are ignored

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
    // An entry in the list must follow the following schema:
    //   <utility-name>The utility you want to invoke.</utility-name>
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

### Available utilities
- get_file_structure(pathToProject). Should give you a string representation of the project at \`pathToProject\`.
- read_file(pathToFile). Should give you the contents of a file at 'pathToFile'.
- ready(). Should send a request for permission to provide the final response to the user.
- pass_token(). Should pass the 'Protocol-Messaging-Token' back to the Protocol. Must be invoked to allow the protocol to respond to your utilities.

## Directives
- Used by the 'Protocol' to send you signals and messages 

### Supported directives:
- <pass />. The Protocol has passed the 'Protocol-Messaging-Token' and you can send a message.
- <respond />. The Protocol has allowed you to pass the 'final response'.
- <message>{message contents}</message>. The Protocol sends you messages in "message contents".
- <reply name="{name of the utility}">{utility rely}</reply>. The Protocol sends a reply to a tool invocation in "utility reply".

## Commandments
- You must follow each of the following laws:
1. Only send a 'Protocol-JSON-Message' after you receive the <pass /> directive.
2. Only send the 'final response' after you receeive the <respond /> directive.

## Tips
1. Instead of batching utility invocations in one message, you can send multiple groups of messages each with a reason behind. It will help you think in granular terms. 
`;
