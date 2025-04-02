import "dotenv/config";
import OpenAI from "openai";
import { Get_ClosingPrompt, Get_SystemPrompt } from "./prompt.js";
import { get_file_structure, read_file } from "./tools.js";

async function startConversation(pathToRepo, userMessage) {
    // Setup
    const apiKey = process.env.OPENAI_KEY;
    const client = new OpenAI({ apiKey });
    const openingPrompt = Get_SystemPrompt(pathToRepo);
    const closingPrompt = Get_ClosingPrompt();
    const conversationStarters = [
        { role: "developer", content: openingPrompt },
        { role: "user", content: userMessage },
    ];
    const conversationHistory = [];

    // Internal state
    let executing = true;
    let turnCount = 0;

    const execute = async (input, doLog = true) => {
        try {
            const response = await client.responses.create({
                model: "gpt-4o",
                input,
                text: { format: { type: "json_object" } },
            });
            const json = JSON.parse(response.output_text);
            doLog && console.info("execution ", JSON.stringify(json, null, 2));
            return json;
        } catch (e) {
            console.error("Error in execute --> ", { e });
        }
    };

    const getConversationHistory = () => {
        const previousMessages = conversationHistory.map(
            ({ content, turnExecutionResults }) => [
                { role: "assistant", content },
                { role: "user", content: turnExecutionResults },
            ]
        );
        return [...conversationStarters, ...previousMessages];
    };
    const executeClosingConversation = async () => {
        const content = await execute(
            [
                ...getConversationHistory(),
                {
                    role: "developer",
                    content: closingPrompt,
                },
            ],
            false
        );
        console.log("Final response ----> ", content);
        executing = true;
        return content;
    };

    do {
        const content = await execute(getConversationHistory());

        /**
         * Temporary lock while building
         */
        if (!content || turnCount == 1) {
            quitConveration();
            break;
        }

        /**
         * The llm has enough context to fulfil task
         * We execute the closing system prompt
         */
        if (content["indicator"] === "READY") {
            quitConveration();
            await executeClosingConversation();
            break;
        }

        const commands = content["commands"];
        const turnExecutionResults = [];

        for (const [index, command] of commands.entries()) {
            switch (command["utility-name"]) {
                case "get_file_structure": {
                    const value = await get_file_structure(command["args"][0]);
                    turnExecutionResults.push({
                        index,
                        cmd: "get_file_structure",
                        value,
                    });
                    break;
                }
                case "read_file": {
                    const value = await read_file(command["args"][0]);
                    turnExecutionResults.push({
                        index,
                        cmd: "read_file",
                        value,
                    });
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
        "sample/control-tower",
        "What is the purpose of this repo?"
    ).catch((e) =>
        console.error(
            "Error when executing startConversation ",
            JSON.stringify(e, null, 2)
        )
    );
}

main();
