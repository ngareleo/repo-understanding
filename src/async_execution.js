import { Transform, PassThrough, pipeline } from "stream";
import "dotenv/config";
import OpenAI from "openai";
import { Get_Protocol_System_Prompt, Get_SystemPrompt } from "./prompt.js";

const llmStream = async () => {
    const apiKey = process.env.OPENAI_KEY;
    const client = new OpenAI({ apiKey });
    const protocolPrompt = Get_Protocol_System_Prompt();
    const mainSystemPrompt = Get_SystemPrompt("sample/control-tower");
    const response = await client.responses.create({
        model: "gpt-4o",
        input: [
            { role: "developer", content: protocolPrompt },
            { role: "developer", content: mainSystemPrompt },
            { role: "user", content: "What is the point of this repo?" },
            { role: "user", content: "<pass />" },
            {
                role: "assistant",
                content: `{
                        "status": "OKAY",
                        "message": "",
                        "commands": [
                            { "utility-name": "get_file_structure", "args": ["sample/control-tower"] }
                            { "utility-name": "pass_token", "args": [] }
                    ]
                }
                `,
            },
            {
                role: "user",
                content: `
                <reply>
                {
                    "utility": "get_file_structure",
                    "reply": [
                        sample/control-tower/.git
                        sample/control-tower/.gitignore
                        sample/control-tower/README.md
                        sample/control-tower/images
                        sample/control-tower/images/hello.png
                        sample/control-tower/manifest.json
                        sample/control-tower/scripts
                        sample/control-tower/scripts/background
                        sample/control-tower/scripts/background/main.js
                        sample/control-tower/scripts/content
                        sample/control-tower/scripts/content/main.js
                        sample/control-tower/scripts/extension
                        sample/control-tower/scripts/extension/popup.js
                        sample/control-tower/scripts/extension/pre.js
                        sample/control-tower/styles
                        sample/control-tower/styles/main.css
                        sample/control-tower/view
                        sample/control-tower/view/index.html"
                    ]
                }
                </reply>
                `,
            },
        ],
        store: true,
        stream: true,
        text: {
            format: { type: "json_object" },
        },
    });

    return response.toReadableStream();
};

class ReplyChunker extends Transform {
    constructor(options) {
        super({ ...options, objectMode: true });
    }

    _transform(chunk, _, cb) {
        const json = JSON.parse(new Buffer.from(chunk).toString());
        if (json["type"] === "response.output_text.done") {
            this.push(json["text"]);
        }
        cb();
    }
}

export const main = async () => {
    /**
     * The assistant API is fairly verbose. It sends multiple "assistant" messages per turn
     *
     * When you read the response in lazily, even if messages are in JSON they are incorrectly appended.
     *
     * One way around the issue is to stream the response and wait for "response.output_text.done" events
     *
     * This will be helpful especially if we expand the protocol as it will allow models to "think as we process"
     *
     * We will be able to invoke tools mid-stream and achieve performance.
     *
     *
     * I need to investigate if this behavior of multiple assistant messages per stream works well.
     */
    const stream = await llmStream();
    pipeline(
        stream,
        new ReplyChunker(),
        new PassThrough().on("data", (chunk) => {
            console.log(chunk.toString());
        }),
        (err) => err && console.error({ err })
    );
};

export default main;
