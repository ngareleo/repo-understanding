import "dotenv/config";
import mainPrompt from "./prompt.js";
import OpenAI from "openai";

(async () => {
    const apiKey = process.env.OPENAI_KEY;

    const client = new OpenAI({ apiKey });

    const response = await client.responses.create({
        model: "gpt-4o",
        input: mainPrompt,
    });

    console.log(response.output_text);
})();
