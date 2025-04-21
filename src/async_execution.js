import { Transform, PassThrough, pipeline } from "stream";
import "dotenv/config";
import OpenAI from "openai";
import { Get_AsyncProtocol_System_Prompt } from "./async_prompt.js";
import { getRepoSysPrompt } from "./repo_understanding.js";

const apiKey = process.env.OPENAI_KEY;
const client = new OpenAI({ apiKey });

const llmStream = async () => {
    const protocolPrompt = Get_AsyncProtocol_System_Prompt();
    const systemPrompt = getRepoSysPrompt("sample/control-tower");
    const response = await client.responses.create({
        model: "gpt-4o",
        input: [
            { role: "developer", content: protocolPrompt },
            { role: "developer", content: systemPrompt },
            { role: "user", content: "What is the point of this repo?" },
        ],
        store: true,
        stream: true,
        text: {
            format: { type: "json_object" },
        },
    });

    return response.toReadableStream();
};

const createReplyChunker = (options) => {
    return new Transform({
        ...options,
        objectMode: true,
        transform(chunk, _, cb) {
            const json = JSON.parse(new Buffer.from(chunk).toString());
            if (json["type"] === "response.output_text.done") {
                this.push(json["text"]);
            }
            cb();
        },
    });
};

export const main = async () => {
    /**
     * The assistant API is fairly verbose. It sends multiple "assistant" messages per turn
     * When you read the response lazily, even if messages are in JSON, they are incorrectly appended and failing on the client.
     * One way around the issue is to stream the response and wait for "response.output_text.done" events and chunk the response.
     * This will be helpful especially especially when we expand the protocol.
     * It will allow models to "think in process" and for us to execute tools as the llm streams.
     * We will be able to invoke tools mid-stream and unlock more performance in our executor.
     * I need to investigate this behavior further
     */
    const stream = await llmStream();
    pipeline(
        stream,
        createReplyChunker({ objectMode: true }),
        new PassThrough().on("data", (chunk) => {
            console.log(chunk.toString());
        }),
        (err) => err && console.error({ err })
    );
};

export default main;
