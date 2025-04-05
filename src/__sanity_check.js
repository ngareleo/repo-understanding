import "dotenv/config";
import OpenAI from "openai";
import { Get_SystemPrompt } from "./prompt.js";

/**
 * ---------------------------------------------------------
 * Alternative entry point.
 *
 * Good for sanity checks when you don't want to write tests
 *
 * (Save tokens[Save the Planet 🌍])
 *
 * ---------------------------------------------------------
 *
 */

(async () => {
    const apiKey = process.env.OPENAI_KEY;
    const client = new OpenAI({ apiKey });

    const mainSystemPrompt = Get_SystemPrompt("sample/control-tower");
    const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "developer", content: mainSystemPrompt },
            { role: "user", content: "What is the point of this repo?" },
            { role: "user", content: "<pass />" },
            {
                role: "assistant",
                content:
                    "{\n" +
                    '    "status": "OKAY",\n' +
                    '    "message": "",\n' +
                    '    "commands": [\n' +
                    '        { "utility-name": "get_file_structure", "args": ["sample/control-tower"] },\n' +
                    '        { "utility-name": "pass_token", "args": [] }\n' +
                    "    ]\n" +
                    "}",
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
            // {
            //     role: "assistant",
            //     content: `'{\n' +
            //         '    "status": "OKAY",\n' +
            //         '    "message": "The repository contains a variety of files including configuration files, source code, tests, and documentation.",\n' +
            //         '    "commands": [\n' +
            //         '        { "utility-name": "read_file", "args": ["sample/control-tower/README.md"] },\n' +
            //         '        { "utility-name": "read_file", "args": ["sample/control-tower/src/index.js"] },\n' +
            //         '        { "utility-name": "read_file", "args": ["sample/control-tower/package.json"] },\n' +
            //         '        { "utility-name": "pass_token", "args": [] }\n' +
            //         '    ]\n' +
            //         '}`,
            // },
            // {
            //     role: "user",
            //     content:
            //         "<message>Why did you respond without a 'Protocol-Messaging-Token? Were the instructions not clear?</message>",
            // },
        ],
        store: true,
        response_format: {
            type: "json_object",
        },
    });
    console.log({ response: response.choices[0].message });
})();
