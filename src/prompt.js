const protocol = "'Protocol'";
const token = "'Protocol-Messaging-Token'";
const message = "'Protocol-JSON-Message'";
const directive = "'Protocol-Directive'";
const pass = "<pass />";
const respond = "<respond />";

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
- In order to invoke a tool you need to send a VALID ${message}.
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
- You should not send any ${message} to the ${protocol} until the ${protocol} sends you the <pass /> directive. 
- The ${pass} directive grants you a ${token} which allows you to invoke utilities.
- You can only send one ${message} at a time and immediately after, you're expected by the ${protocol} to pass give back the token by invoking the "pass_token" utility.
- You will not invoke any more tools until you see another ${pass} directive.
- If you send more that one message, only the first message is accepted by the ${protocol}. All subsequent messages are ignored.
- ${directive} are a mechanism through which the ${protocol} sends messages and signals to you.
- You must honor the directives system.

## The ${message}
- The ${protocol} requires that you send ${message}'s to invoke utilities.
- Remember that after submitting ONE ${message} you MUST pass the token otherwise your messages won't reach the other end.

### ${message} Schema
{
    "status": \`An indication of your ability to execute the task. Can be "OKAY" or "ERROR".</status>\`,
    "message": \`
    // Use this field to pass back a message to the ${protocol}.
    // You can use this field in your messages to state your reasoning behind tool invocations.
    // Incase 'status' is "ERROR" you MUST provide a reason here.
    \`,
    "commands": \`
    // A list of utilities you chose to invoke.
    // The order of utility invocation matters. 
    // Because of the limitations of the token system (you send only one ${message} and pass the token), try to batch utility invocations
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
- pass_token(). (REQUIRED). You must invoke this utility for every ${message}.

## Directives
- Used by the ${protocol} to send you signals and messages 

### Supported directives:
- <pass />. The Protocol has passed the ${token} and you can send a message.
- <respond />. The Protocol has allowed you to pass the 'final response'.
- <message>{message contents}</message>. The Protocol sends you messages in "message contents".
- <reply>{utility rely}</reply>. The Protocol sends a reply to a tool invocation in "utility reply".

## Commandments
- You must follow each of the following laws:
1. Only send one ${message}.
2. Pass token after sending a ${message}.
3. Only send a ${message} after you receive the ${pass} directive.
4. Only send the 'final response' after you receeive the ${respond} directive.
`;

export const Get_Thinking_Prompt = () => `
# Protocol Thinking Extension
- The ${protocol} has enabled the 'thinking extension'. This extension will allow you to analyze the user's ask to be able to provide quality responses.
- Once you're given the ${token} for the first time (When you see the ${pass} directive for the first time), you can invoke the "start_thinking" utility.
- This utility marks the 'thinking phase'.
- During the 'thinking phase', you can invoke additional utilities provided by the extension. However there is an order of invocation, 

# Additional Terminology
- 'Tool Queue'. This is an internal ${protocol} buffer that you prepare during the 'thinking phase'. It contains utility invocations you anticipate will be needed.
- 'Step Plan'. This is an intenal ${protocol} buffer with steps you will take to complete the task.
- 'Task Analysis Report'. This is a report you hand to the ${protocol} at the start of the 'thinking phase'

# Extension Instructions
- First, you must provide the ${protocol} with a 'Task Analysis Report'. This is a summary of what you think the user needs from you.
- Second, you pass the report through the "send_report(report)" utility, where report is the summary.
- Third, you must come up with steps of how you will achieve the task in the report. 
- You must load these steps into the 'Step Plan' by invoking the "push_step()" utility. 
- TIP: Invoke it multiple times in a single ${message}. Example
\`\`\`
{
    status: "OKAY",
    message: "",
    commands: [
        { "utility-name": "push_step", args: ["Check dependencies"] },
        { "utility-name": "push_step", args: ["Read files"] },
        { "utility-name": "push_step", args: ["Analyse code"] },
        { "utility-name": "push_step", args: ["Respond"] },
        { "utility-name": "commit_steps", args: [] },
        { "utility-name": "pass_token", args: [] },
    ]
}
\`\`\`
- You must invoke "commit_steps" utility to seal the 'Step Plan'. Once sealed, it cannot be changed.
- Fourth, you should come up with sets of utility invocations needed to fulfil each step. 
- Similar to the previous step, you must push each set of invocations into the 'Tool Queue' using the "push_invocation(utility)" utility.
- You must seal the 'Tool queue' using the "commit_tools" utility.
- TIP: Invoke it multiple times in a single ${message}.
- Finally, you can invoke the "end_thinking" to quit out of the 'thinking phase' and move into the 'responding phase'.
- In the 'responding phase' you will refer to the 'Tool queue' and the 'Step queue', invoke tools from the ${protocol} and finally respond.

# Additional Utilities
- start_thinking(). Invoke this utility to start the thinking process.
- send_report(report). Use this utility to send a report of your analysis of the task.
- push_step(step). Use this utility to add a step in your execution plan.
- commit_steps(). Invoke this utility after committing all your steps.
- push_invocation(utility). This pushes a utility to the tool queue.
- commit_tools(). This commits the tool queue as-is to the Protocol.
- peek_tool_queue(). This tool can let you look into the Tool Queue.
- end_thinking(). Invoke this utility to end the thinking phase.

#  Additional Directives
- <thinking-end />. This indicates end of thinking.

# Hints
- Once you start the responding phase, you should peek into the tool queue to reconsider if the pl
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
