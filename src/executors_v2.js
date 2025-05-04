import {
  Get_Fs_Extension,
  Get_Protocol_System_Prompt as Get_Protocol_System_V2Prompt,
  Get_Thinking_Prompt,
} from "./prompt_v2";

const apiKey = process.env.OPENAI_KEY;
const client = new OpenAI({ apiKey });

class Executor {
  constructor(params) {}

  /**
   * Register a Protocol System extension.
   * @param   {Object}           args
   * @param   {string}           args.name     The name of the extension.
   * @param   {Function()}           args.handler  A routine to be handle utility invocations
   * @returns {Promise<string>}
   */
  extend(extension) {}

  /**
   * Executes a user utterance using the Protocol System V2.
   * @param   {Object}           args
   * @param   {string}           args.systemPrompt Original system prompt.
   * @param   {string}           args.userMessage  An initial user message to kick off orchestration.
   * @param   {string|undefined} args.formatPrompt Formatting instructions for the final response.
   * @returns {Promise<string>}
   */
  execute({ systemPrompt, userMessage, formatPrompt }) {}
}

/**
 * Based off v2 prompt.
 */
export async function main() {
  const fsExtension = {
    name: "fs",
    prompt: Get_Fs_Extension(),
    handler: ({ args }) => {
      const [] = args;
    },
  };

  const thinkingExtension = {
    name: "thinking",
    prompt: Get_Thinking_Prompt(),
    handler: ({ args }) => {},
  };
}

/**
 * Uses the Protocol System V2
 * @param   {Object}           args
 * @param   {string}           args.systemPrompt Original system prompt.
 * @param   {string}           args.userMessage  An initial user message to kick off orchestration.
 * @param   {string|undefined} args.formatPrompt Formatting instructions for the final response.
 * @returns {Promise<string>}
 */
export const linearExtendedLLMExecutor = async ({
  systemPrompt,
  userMessage,
  formatPrompt,
}) => {
  const protocol = Get_Protocol_System_V2Prompt();

  let executing = true;
  let readyToGenerate = false;
  const history = [];

  const starters = [
    { role: "developer", content: protocol },
    { role: "developer", content: systemPrompt },
    { role: "user", content: userMessage },
    { role: "user", content: "<pass />" },
  ];
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
    const previousMessages = history.reduce(
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
      ...starters,
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
            ...(formatPrompt
              ? [
                  {
                    role: "developer",
                    content: formatPrompt,
                  },
                ]
              : []),
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

    history.push({ turnExecutionResults, content });
  } while (executing);
};
