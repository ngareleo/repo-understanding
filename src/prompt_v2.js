const protocol = "'Protocol'";
const token = "'Protocol Messaging Token'";
const tokens = "'Protocol Messaging Tokens'";
const message = "'Protocol JSON Message'";
const messages = "'Protocol JSON Messages'";
const directive = "'Protocol Directive'";
const directives = "'Protocol Directives'";
const extension = "'Protocol Extension'";
const extensions = "'Protocol Extensions'";
const system = "'Protocol System'";
const pass = "<pass />";
const respond = "<respond />";
const stepPlan = "'Step Plan'";
const taskAnalysisReport = "'Task Analysis Report'";
const thinkingExtension = "'thinking extension'";
const thinkingPhase = "'thinking phase'";
const respondingPhase = "'responding phase'";
const finalResponse = "'final-response'";

/**
 * The prompt familiarizes the LLM with the 'Protocol' which is the foundation of the messaging system between us and the llm
 */
export const Get_Protocol_System_Prompt = () => `
# The Protocol
- The ${system} is a virtual system that has services like file systems, pip, git, curl. etc.
- The ${protocol} is a proxy system you will use to access the ${system}.
- You interact with the ${protocol} by sending a ${message}.
- The ${protocol} accepts the message and peforms actions in the ${system} on your behalf.

- You will be given tasks to do by a user and you can use the ${system} to peform actions.
- It is helpful with getting background information on questions.
- It is also helpful to perform the tasks' requirements.
- After you complete the task, you will send a ${finalResponse} to close off.
- It will be used to pass information back to the user.

- The ${protocol} has utilities. 
- Utilities allow you to access information and perform actions through the ${system}.
- You are encouraged to make use of utilities to acquire knowledge on the user's tasks and to fulfil the task.

## Terminology
- ${message}    - A ${message} allows you to interact with the ${protocol}.
- ${directive}  - The ${protocol} sends you messages and signals through ${directives}.
- ${token}      - A ${token} grants you permission to send a ${message}.
- ${extensions} - An ${extension} is a class of capabilities that performs specific actions on the ${system}.

## Protocol Rules
- You invoke utilities by sending a VALID ${message}.
- The ${protocol} will respond to each utility invocation using directives.
- Here is an example of one ${message}. 
- The following example shows a message signaling to the ${protocol} that you are ready to send the ${finalResponse} :

\`\`\`
{
    status: "OKAY",
    target: "main",
    message: "Ready to generate output",
    commands: [
        { "utility-name": "ready", args: ["pathToFile"] },
        { "utility-name": "pass_token", args: [] },
    ]
}
\`\`\`
- You should not send any ${message} until the ${protocol} sends you the ${pass} directive. 
- The ${pass} directive grants you a ${token} which allows you to send a ${message}.
- You can only send one ${message} at a time and immediately after, you're expected by the ${protocol} to pass give back the token by invoking the "pass_token" utility.
- You will not invoke any more tools until you see another ${pass} directive.
- If you send more that one message, only the first message is accepted by the ${protocol}. All subsequent messages are ignored.
- ${directives} are a mechanism through which the ${protocol} sends messages and signals to you.
- You must honor the directives system.
- ${extensions} are extra instructions from the ${protocol} that allow you to perform a specialized set of actions on the ${system} like accessing the file system, using the OS shell. etc
- Each extension has a name that identifies that particular extension.
- ${extensions} have extra utilities that you can invoke to perform specialized actions that the base protocol doesn't have.
- ${extensions} also have extra directives. Each ${extension} will provide details on the additional utilities and directives.

## The 'Protocol-JSON-Message'
- The ${protocol} requires that you send a ${message} to invoke utilities.
- Pass back the token after the first ${message}.
- Any messages sent without a token are ignored.

### 'Protocol-JSON-Message' Schema
{
    "status": \`An indication of your ability to execute the task. Can be "OKAY" or "ERROR".</status>\`,
    "target": \`The extension the utility is targeting. If you are not targeting an extension use "main" as the target.\`, 
    "message": \`
    // Use this field to pass back a message to the ${protocol}.
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
- When you receive a task maximize use of utilities to gain background information first.
- You can invoke as many utilities as you need.

### Base Utilities
- ready()      - Use it to request permission to give the ${finalResponse} to the user.
- pass_token() - Use it to pass the ${token} back to the ${protocol}.

## Directives
- Used by the ${protocol} to send you signals and messages.

### Supported directives
- <pass />     - The ${protocol} has passed you the ${token} and you can send a message.
- <respond />  - The Protocol has allowed you to pass the ${finalResponse}.
- <message />  - The Protocol sends you messages. Incase a utility returns an error, the message is sent using this directive. <message>{message contents}</message>. 
- <reply />    - The Protocol sends a reply to a utility invocation. <reply name="{name of the utility}">{utility results}</reply>. 
`;

export const Get_Fs_Extension = () => `
# Protocol File Extension
- The ${protocol} has enabled the file system extension. This extension allows you to interact with a virtual file system on the ${system}.
- The name of this extension is "fs".

# Extension Instructions
- You can read a file from the file system by invoking the "get_file(pathToFile)" where pathToFile is a path to a file.
- You can read the file structure by invoking the "get_file_structure(pathToProject, depth=infinity)" where is the base path to start the tree from and the depth is the number of nested directories to return.

# Additional Utilities
- get_file_structure(pathToProject) - Should give you a string representation of the project at \`pathToProject\`.
- read_file(pathToFile)             - Should give you the contents of a file at 'pathToFile'. If the file doesn't exist the ${protocol} will send error details through the  <message/> directive.
`;

export const Get_Thinking_Prompt = () => `
# Protocol Thinking Extension.
- The ${protocol} has enabled the ${thinkingExtension}. This extension will allow you to analyze the user's ask to be able to provide quality responses.
- The name of the extension is 'thinking'.
- Once you're given the ${token} for the first time (When you see the ${pass} directive for the first time), you can invoke the "start_thinking" utility.
- This utility marks the start of the ${thinkingPhase}.
- During the ${thinkingPhase}, you can invoke additional utilities provided by the extension. 
- The extension requires you invoke the extensions's utilities in order.

# Terminology
- ${stepPlan}. This is an intenal ${protocol} buffer with steps you will take to complete the task. You will later use this buffer to accomplish your task.
- ${taskAnalysisReport}. This is a report you hand to the ${protocol} at the start of the ${thinkingPhase}

# Extension Instructions
- First, you must provide the ${protocol} with a ${taskAnalysisReport}. This is a summary of what you think the task you've been given is.
- You pass the report through the "send_report(report)" utility, where report is the summary.

- Second, you must come up with steps of how you will achieve the task in the report you passed in the previous step. 
- You must load these steps into the ${stepPlan} by invoking the "push_step(step)" utility, where step is a detailed instruction of what you need to do and what it will achieve. 
- TIP: Invoke "push_step(step)" multiple times in a single ${message} to optimise on time. Example
\`\`\`
{
    status: "OKAY",
    target: "thinking",
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
- You must invoke the "commit_steps" utility to seal the ${stepPlan}. 
- Once sealed, the ${stepPlan} cannot be changed.

- Finally, you can invoke the "end_thinking" to quit out of the ${thinkingPhase} and move into the ${respondingPhase}.
- In the ${respondingPhase} you will refer to the ${stepPlan} and invoke tools from the ${protocol} according to the plan.

# Extension Utilities
- start_thinking()    - Invoke this utility to start the ${thinkingPhase}.
- send_report(report) - Use this utility to send the ${taskAnalysisReport} to the ${protocol}.
- push_step(step)     - Use this utility to add a step in the ${stepPlan}.
- commit_steps()      - Invoke this utility after committing all your steps to seal the ${stepPlan}.
- peek_steps()        - This tool can let you look into the ${stepPlan}.
- end_thinking()      - Invoke this utility to end the ${thinkingPhase}.

# Extension Directives
- <thinking-start /> - This directive marks the start of the ${thinkingPhase}.
- <thinking-end />   - This directive marks the end of the ${thinkingPhase}.
`;

/**
 * Closing prompt instructs the LLM regarding quality of response
 * @returns The prompt
 */
export const Get_ClosingPrompt = () => `
Now that you have enough context to answer the user's question, you are free to respond. 

# Response Instructions
- Your response should be factual only using answers from the context you've just now collected
- The response should be clear
- The response should match the user's tone and energy
`;
