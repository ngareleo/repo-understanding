const protocol = "'Protocol'";
const token = "'Protocol-Messaging-Token'";
const message = "'Protocol-JSON-Message'";
const directive = "'Protocol-Directive'";
const extensions = "'Protocol-Extensions'";
const system = "'Protocol-System'";
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
- The ${protocol} is a messaging system you can refer to gain context on your tasks.
- The ${protocol} requires that you first create a plan of execution and your goal should be to collect at much context as needed.
- After you have enough context, you will send a 'final response' to fulfil the task.
- The Protocol grants you a set of utilities. 
- Utilities allow you to access information that's on the Protocol and to interface with the ${protocol}.
- You are encouraged to make use of utilities to help fulfil the user's tasks.

## Terminology
- ${message} are messages you pass to the ${protocol} to perform actions like invoking utilities. We will refer to them as "messages".
- ${directive} are a mechanism through which the ${protocol} sends messages and signals to you. We will refer to them as "directives".
- ${token} allow you to send ${message}. We will refer to them as "tokens".
- ${extensions} are extra instructions that allow you to do specific actions on the ${protocol}. We will refer to them as "extensions".

## Protocol Rules
- You invoke utilities by sending VALID message.
- The ${protocol} will respond to each utility invocation using directives.
- Here is an example of one ${message}. 
- The following example shows a message signalling to the ${protocol} that you are ready to send the ${finalResponse} :

\`\`\`
{
    status: "OKAY",
    target: "main",
    message: "",
    commands: [
        { "utility-name": "ready", args: ["pathToFile"] },
        { "utility-name": "pass_token", args: [] },
    ]
}
\`\`\`
- You should not send any ${message} until the ${protocol} sends you the ${pass} directive. 
- The ${pass} directive grants you a ${token} which allows you to invoke utilities.
- You can only send one ${message} at a time and immediately after, you're expected by the ${protocol} to pass give back the token by invoking the "pass_token" utility.
- You will not invoke any more tools until you see another ${pass} directive.
- If you send more that one message, only the first message is accepted by the ${protocol}. All subsequent messages are ignored.
- ${directive} are a mechanism through which the ${protocol} sends messages and signals to you.
- You must honor the directives system.
- ${extensions} are extra instructions from the ${protocol} that allow you to perform extra actions on the ${system} like accessing the file system. etc
- Each extension has a name that you will use to refer to the extension.
- Extensions have extra utilities that you can invoke to perform extra actions that the base protocol doesn't have.

## The 'Protocol-JSON-Message'
- The ${protocol} requires that you send a ${message} to invoke utilities.
- Remember to pass back the token.
- Remember that any messages sent without a token are ignored.

### 'Protocol-JSON-Message' Schema
{
    "status": \`An indication of your ability to execute the task. Can be "OKAY" or "ERROR".</status>\`,
    "target": \`The extension the utility is targeting. If you are not targeting an extension use "main" as the target.\`, 
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
- ready(). Should send a request for permission to provide the final response to the user.
- pass_token(). Should pass the 'Protocol-Messaging-Token' back to the Protocol. Must be invoked to allow the protocol to respond to your utilities.

## Directives
- Used by the 'Protocol' to send you signals and messages 

### Supported directives:
- <pass />. The Protocol has passed you the 'Protocol-Messaging-Token' and you can send a message.
- <respond />. The Protocol has allowed you to pass the 'final response'.
- <message>{message contents}</message>. The Protocol sends you messages in "message contents".
- <reply name="{name of the utility}">{utility rely}</reply>. The Protocol sends a reply to a tool invocation in "utility reply".
`;

export const Get_File_Extension = () => `
# Protocol File Extension { "target": "file" }
- The ${protocol} has enabled the file extensions. This extension allows you to interact with a file system.

# Extension Instructions
- You can read a file from the file system by invoking the "get_file(pathToFile)" where pathToFile is a path to a file.
- You can read the file structure by invoking the "get_file_structure(pathToProject, depth=infinity)" where is the base path to start the tree from and the depth is the number of nested levels.

# Additional Utilities
- get_file_structure(pathToProject). Should give you a string representation of the project at \`pathToProject\`.
- read_file(pathToFile). Should give you the contents of a file at 'pathToFile'. If the file doesn't exist it triggers a <message/> directive with error message.
`;

export const Get_Thinking_Prompt = () => `
# Protocol Thinking Extension { target: "thinking" }
- The ${protocol} has enabled the ${thinkingExtension}. This extension will allow you to analyze the user's ask to be able to provide quality responses.
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

# Additional Utilities
- start_thinking(). Invoke this utility to start the ${thinkingPhase}.
- send_report(report). Use this utility to send the ${taskAnalysisReport} to the ${protocol}.
- push_step(step). Use this utility to add a step in the ${stepPlan}.
- commit_steps(). Invoke this utility after committing all your steps to seal the ${stepPlan}.
- peek_steps(). This tool can let you look into the ${stepPlan}.
- end_thinking(). Invoke this utility to end the ${thinkingPhase}.

#  Additional Directives
- <thinking-start />. This directive marks the start of the ${thinkingPhase}.
- <thinking-end />. This directive marks the end of the ${thinkingPhase}.
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
