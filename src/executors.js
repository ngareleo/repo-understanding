import "dotenv/config";
import { Get_ClosingPrompt, Get_Protocol_System_Prompt } from "./prompt.js";
import { get_file_structure, read_file } from "./tools.js";

const apiKey = process.env.OPENAI_KEY;
const client = new OpenAI({ apiKey });

export async function linearLLMExecutor(systemPrompt, userMessage) {
    const protocolPrompt = Get_Protocol_System_Prompt();
    const closingPrompt = Get_ClosingPrompt();

    const conversationStarters = [
        { role: "developer", content: protocolPrompt },
        { role: "developer", content: systemPrompt },
        { role: "user", content: userMessage },
        { role: "user", content: "<pass />" },
    ];

    const conversationHistory = [];
    let executing = true;
    let readyToGenerate = false;

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
            throw Error("Internal problem. Missing response from LLM Service");
        }

        if (content["final-response"]) {
            return content["final-response"];
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
