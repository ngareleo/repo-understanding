import "dotenv/config";
import OpenAI from "openai";
import Get_Prompt from "./prompt.js";
import { get_file_structure, read_file } from "./tools.js";

const getLLMExecution = () => {
    const apiKey = process.env.OPENAI_KEY;
    const client = new OpenAI({ apiKey });

    // Internal state
    const history = [];
    let turnCount = 0;
    let executing = true;

    /**
     * Creates a new conversation and sets the current conversation ID.
     *
     * @param {Object} props - The properties for the new conversation.
     * @param {string} props.conversationId - The ID of the conversation to set as current.
     */
    const newConversation = (props) => {
        history.push({
            index: turnCount++,
            conversationId: props.conversationId,
            json: props.json,
        });
    };

    /**
     * Stops the llm execution loop
     */
    const quitConveration = async () => {
        executing = false;
    };

    /**
     * Executes one round trip to OPENAI LLM
     * @param {string} input The prompt passed to the LLM
     * @returns
     */
    const llmTurn = async (input) => {
        const response = await client.responses.create({
            model: "gpt-4o",
            input,
            text: { format: { type: "json_object" } },
        });
        const json = JSON.parse(response.output_text);
        newConversation({ conversationId: response.id, json });
        console.info("llmTurn, ", JSON.stringify(json, null, 2));
        return json;
    };

    return { llmTurn, quitConveration, turnCount, executing, history };
};

async function startConversation(pathToRepo, userMessage) {
    const instructions = Get_Prompt(pathToRepo);
    const { llmTurn, quitConveration, turnCount, executing, history } =
        getLLMExecution();
    const conversationStarters = [
        { role: "developer", content: instructions },
        { role: "user", content: userMessage },
    ];
    const internalExecutionResults = [];
    const getConversationHistory = () => {
        const previousMessages = internalExecutionResults.map(
            (result, index) => [
                { role: "assistant", content: history[index] },
                { role: "user", content: result },
            ]
        );
        return [...conversationStarters, ...previousMessages];
    };
    const closeConversation = async () => {
        const content = await llmTurn([
            ...getConversationHistory(),
            {
                role: "developer",
                content:
                    "Now that you have enough context. Answer the users questions with utmost clarity",
            },
        ]);
        return content;
    };

    do {
        const content = await llmTurn(getConversationHistory());

        /**
         * Temporary lock while building
         */
        if (turnCount == 1) {
            quitConveration();
            break;
        }

        if (content["indicator"] === "READY") {
            quitConveration();
            const finalResponse = await closeConversation();
            console.log({ finalResponse });
            break;
        }

        const commands = content["commands"];
        const turnOutput = [];

        for (const [index, command] of commands.entries()) {
            switch (command["utility-name"]) {
                case "ready": {
                    readyToGenerate = true;
                    turnOutput.push({ index, cmd: "ready" });
                    break;
                }
                case "get_file_structure": {
                    const value = await get_file_structure(command["args"][0]);
                    turnOutput.push({
                        index,
                        cmd: "get_file_structure",
                        value,
                    });
                    break;
                }
                case "read_file": {
                    const value = await read_file(command["args"][0]);
                    turnOutput.push({
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

        internalExecutionResults.push(turnOutput);
    } while (executing);
}

function main() {
    startConversation(
        "samples/control-tower",
        "What is the purpose of this repo?"
    ).catch((e) =>
        console.error(
            "Error when executing startConversation ",
            JSON.stringify(e, null, 2)
        )
    );
}

main();
