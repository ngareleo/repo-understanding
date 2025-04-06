import "dotenv/config";
import OpenAI from "openai";
import { Get_ClosingPrompt, Get_SystemPrompt } from "./prompt.js";
import { get_file_structure, read_file } from "./tools.js";

async function startConversation(pathToRepo, userMessage) {
    const apiKey = process.env.OPENAI_KEY;
    const client = new OpenAI({ apiKey });
    const mainSystemPrompt = Get_SystemPrompt(pathToRepo);
    const closingPrompt = Get_ClosingPrompt();

    const conversationStarters = [
        { role: "developer", content: mainSystemPrompt },
        { role: "user", content: userMessage },
        { role: "user", content: "<pass />" },
    ];

    const conversationHistory = [];
    const conversationSystemLogs = [];
    let executing = true;
    let readyToGenerate = false;
    let turnCount = 0;

    const execute = async (messages) => {
        const response = await client.chat.completions.create({
            model: "gpt-4o",
            messages,
            store: true,
            response_format: {
                type: "json_object",
            },
        });

        if (response.choices.length == 0) {
            return undefined;
        }

        const message = response.choices[0].message;
        console.info({ message });
        conversationSystemLogs.push({ turnCount, message });
        turnCount += 1;

        return JSON.parse(message.content);
    };
    const getConversationHistory = () => {
        const previousMessages = conversationHistory.reduce(
            (prev, { content, turnExecutionResults }) => [
                ...prev,
                {
                    role: "assistant",
                    content: JSON.stringify(content, null, 2),
                },
                {
                    role: "user",
                    content: JSON.stringify(turnExecutionResults, null, 2),
                },
            ],
            []
        );
        return [
            ...conversationStarters,
            ...previousMessages,
            ...(readyToGenerate
                ? [
                      {
                          role: "user",
                          content: "<respond />",
                      },
                      {
                          role: "developer",
                          content: closingPrompt,
                      },
                  ]
                : []),
        ];
    };
    const toggleReadyToGenerate = () => {
        readyToGenerate = true;
    };

    /**
     * The execution loop allows chain of thought
     */
    do {
        const turnExecutionResults = [];

        const content = await execute(getConversationHistory());

        if (!content) {
            return;
        }

        if (content["final-response"]) {
            console.log({ finalResponse: content["final-response"] });
            break;
        }

        const commands = content["commands"];

        for (const command of commands) {
            switch (command["utility-name"]) {
                case "get_file_structure": {
                    const value = await get_file_structure(command["args"][0]);
                    turnExecutionResults.push(
                        `
                            <reply />
                             {
                                cmd: "get_file_structure",
                                reply: ${JSON.stringify(value, null, 2)}
                             }
                            </reply />
                        `
                    );
                    break;
                }
                case "read_file": {
                    const value = await read_file(command["args"][0]);
                    turnExecutionResults.push(
                        `
                            <reply />
                             {
                                cmd: "read_file",
                                reply: ${JSON.stringify(value, null, 2)}
                             }
                            </reply />
                        `
                    );
                    break;
                }
                case "pass_token": {
                    // noop for now
                    break;
                }
                case "ready": {
                    toggleReadyToGenerate();
                    break;
                }

                default: {
                    console.error("Invalid utility from LLM ", command);
                }
            }
        }

        conversationHistory.push({ turnExecutionResults, content });
    } while (executing);
}

function main() {
    startConversation(
        "sample/scrapy",
        "Give me details of the internal implementation and purpose of this repository. I want to implement such a thing and need to know what concepts I need to understand."
    );
}

main();
