import "dotenv/config";
import OpenAI from "openai";
import Get_Prompt from "./prompt.js";
import { get_file_structure } from "./tools.js";

/**
 * Executes one round trip to OPENAI LLM
 * @param {string} input The prompt passed to the LLM
 * @returns
 */
const llmTurn = async (input) => {
    const apiKey = process.env.OPENAI_KEY;
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
        model: "gpt-4o",
        input,
        text: { format: { type: "json_object" } },
    });
    const json = JSON.parse(response.output_text);
    console.info("llmTurn, ", JSON.stringify(json, null, 2));
    return json;
};

const startConversation = async () => {
    const pathToRepo = process.argv[2];
    const openingPrompt = Get_Prompt(pathToRepo);
    let readyToGenerate = false;

    // while (!readyToGenerate) {
    const output = await llmTurn(openingPrompt);
    const commands = output["commands"];

    switch (output["utility-name"]) {
        case "ready": {
            readyToGenerate = true;
            break;
        }
        case "get_file_structure": {
            get_file_structure(output[""]);
        }
        case "read_file": {
        }
        default: {
        }
    }

    // }
};

const main = async () => {
    return startConversation();
};

main().catch((e) => console.error("Main execution failed with error ", e));
