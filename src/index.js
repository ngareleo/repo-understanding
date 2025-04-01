import "dotenv/config";
import OpenAI from "openai";
import Get_Prompt from "./prompt.js";
import { get_file_structure, read_file } from "./tools.js";

const getLLMExecution = () => {
    const apiKey = process.env.OPENAI_KEY;
    const client = new OpenAI({ apiKey });

    // Internal state
    let history = [];
    let turnCount = 0;
    let executing = true;
    let currentConversationId = undefined;

    /**
     * Creates a new conversation and sets the current conversation ID.
     *
     * @param {Object} props - The properties for the new conversation.
     * @param {string} props.conversationId - The ID of the conversation to set as current.
     */
    const newConversation = (props) => {
        currentConversationId = props.conversationId;
        history.push({
            index: history.length + 1,
            conversationId: props.conversationId,
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
            ...(input
                ? { input }
                : { previous_response_id: currentConversationId }),
            text: { format: { type: "json_object" } },
        });
        newConversation({ conversationId: response.id });
        const json = JSON.parse(response.output_text);
        console.info("llmTurn, ", JSON.stringify(json, null, 2));
        return json;
    };

    return { llmTurn, quitConveration, turnCount, executing };
};

async function startConversation() {
    const pathToRepo = process.argv[2];
    const openingPrompt = Get_Prompt(pathToRepo);
    const { llmTurn, quitConveration, turnCount, executing } =
        getLLMExecution();

    while (executing) {
        const output = await llmTurn(openingPrompt);
        const commands = output["commands"];

        /**
         * Temporary lock while building
         */
        if (turnCount == 1) {
            quitConveration();
        }

        let out = [];
        /**
         * We will build an execution loop of thought for the LLM by chaining messages
         * We will provide the LLM with an objective and it will decide whether it has finished said task
         * The loop will then end
         */
        for (const [index, command] of commands.entries()) {
            switch (command["utility-name"]) {
                case "ready": {
                    readyToGenerate = true;
                    out.push({ index, cmd: "ready" });
                    break;
                }
                case "get_file_structure": {
                    const value = await get_file_structure(command["args"][0]);
                    out.push({
                        index,
                        cmd: "get_file_structure",
                        value,
                    });
                    break;
                }
                case "read_file": {
                    const value = await read_file(command["args"][0]);
                    out.push({
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

        console.log(JSON.stringify(out, null, 2));
    }
}

function main() {
    startConversation().catch((e) =>
        console.error(
            "Error when executing startConversation ",
            JSON.stringify(e, null, 2)
        )
    );
}

main();
