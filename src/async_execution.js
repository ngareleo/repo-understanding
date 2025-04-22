import { Transform, PassThrough, pipeline } from "stream";
import "dotenv/config";
import OpenAI from "openai";
import { Get_AsyncProtocol_System_Prompt } from "./async_prompt.js";

const apiKey = process.env.OPENAI_KEY;
const client = new OpenAI({ apiKey });

export const getAsyncRepoSysPrompt = (pathToRepo) => `
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
`;

/**
 * @param {object} props
 * @param {string} props.systemPrompt Task guidelines for the llm.
 * @param {string} props.userMessage  User's tasks
 * @returns                           A readable stream of an llm's response.
 */
const llmStream = async ({ systemPrompt, userMessage }) => {
    const protocolPrompt = Get_AsyncProtocol_System_Prompt();

    const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "developer", content: protocolPrompt },
            { role: "user", content: systemPrompt },
            { role: "user", content: userMessage },
            { role: "user", content: "<pass />" },
        ],
        store: true,
        stream: true,
        response_format: { type: "json_object" },
    });

    return response.toReadableStream();
};

/**
 * Waits for a "response.output_text.done" event and chunks the response
 * adding it to the internal buffer
 * @param {import("stream").TransformOptions} options
 * @returns {Transform}
 */
const createReplyChunker = (options = {}) => {
    return new Transform({
        objectMode: true,
        ...options,
        transform(chunk, _, cb) {
            const json = JSON.parse(new Buffer.from(chunk).toString());
            if (json["type"] === "response.output_text.done") {
                this.push(json["text"]);
            }
            cb();
        },
    });
};

/**
 * Logs each parsed response
 * @param {import("stream").StreamOptions} options
 * @returns {PassThrough}
 */
const createLogger = (options = {}) => {
    return new PassThrough({ objectMode: true, ...options }).on(
        "data",
        (chunk) => {
            console.log(JSON.stringify(JSON.parse(chunk), null, 2));
        }
    );
};

/**
 * Logs each raw OPENAI response
 * @param {import("stream").StreamOptions} options
 * @returns {PassThrough}
 */
const createRawLogger = (options = {}) => {
    return new PassThrough({ objectMode: true, ...options }).on(
        "data",
        (chunk) => {
            console.log(new Buffer.from(chunk).toString());
        }
    );
};

/**
 * The assistant API is fairly verbose. It sends multiple "assistant" messages per turn
 * When you read the response lazily, even if messages are in JSON, they are incorrectly appended and failing on the client.
 * One way around the issue is to stream the response and wait for "response.output_text.done" events and chunk the response.
 * This will be helpful especially especially when we expand the protocol.
 * It will allow models to "think in process" and for us to execute tools as the llm streams.
 * We will be able to invoke tools mid-stream and unlock more performance in our executor.
 * I need to investigate this behavior further
 */
export const main = async () => {
    const systemPrompt = getAsyncRepoSysPrompt("sample/control-tower");
    const userMessage = process.argv[3] || "What is the point of this repo?";
    const stream = await llmStream({ systemPrompt, userMessage });
    pipeline(
        stream,
        createRawLogger(),
        createReplyChunker(),
        createLogger(),
        (err) => err && console.error({ err })
    );
};

export default main;
