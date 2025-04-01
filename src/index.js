import "dotenv/config";
import OpenAI from "openai";
import Get_Prompt from "./prompt.js";
import { get_file_structure, read_file } from "./tools.js";

/**
 * Executes one round trip to OPENAI LLM
 * @param {string} input The prompt passed to the LLM
 * @returns
 */
async function llmTurn(input) {
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
}

async function startConversation() {
    const pathToRepo = process.argv[2];
    const openingPrompt = Get_Prompt(pathToRepo);
    let readyToGenerate = false;

    const output = await llmTurn(openingPrompt);
    const commands = output["commands"];
    let out = [];

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

    const secondTurn = await llmTurn();

    console.log(JSON.stringify(out, null, 2));
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
