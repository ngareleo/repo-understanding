import "dotenv/config";
import Get_MainPrompt from "./prompt.js";
import OpenAI from "openai";

const pathToRepo = process.argv[2];

(async () => {
    const apiKey = process.env.OPENAI_KEY;

    const client = new OpenAI({ apiKey });

    const response = await client.responses.create({
        model: "gpt-4o",
        input: Get_MainPrompt(pathToRepo),
    });

    console.log(response.output_text);
})();
