import {
  Get_Closing_Prompt,
  Get_Fs_Extension,
  Get_Protocol_System_Prompt as Get_Protocol_System_V2Prompt,
  Get_Thinking_Extension,
} from "./prompt_v2";

const apiKey = process.env.OPENAI_KEY;
const client = new OpenAI({ apiKey });

export class Executor {
  executing = true;
  readyToGenerate = false;
  history = [];
  extensions = new Set();

  /**
   * Register a Protocol System extension.
   * @param   {Object}           args
   * @param   {string}           args.name     The name of the extension.
   * @param   {Function()}       args.handler  A routine to be handle utility invocations
   * @returns {Promise<string>}
   */
  extension(extension) {
    extensions.add(extension);
    return self;
  }

  #execute = async (messages) => {
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

  /**
   * @param   {Object}             args
   * @param   {string}             args.systemPrompt Original system prompt.
   * @param   {string}             args.userMessage  An initial user message to kick off orchestration.
   * @param   {string | undefined} args.formatPrompt Formatting instructions for the final response.
   */
  #getConversationHistory = ({ systemPrompt, userMessage, formatPrompt }) => {
    const protocol = Get_Protocol_System_V2Prompt();
    const protocolClosingPrompt = Get_Closing_Prompt();

    const starters = [
      { role: "developer", content: protocol },
      // Add prompts for each extension enabled
      ...extensions.map((extension) => extension["prompt"]),
      { role: "developer", content: systemPrompt },
      { role: "user", content: userMessage },
      { role: "user", content: "<pass />" },
    ];

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

    const closingPrompts = readyToGenerate
      ? [
          {
            role: "developer",
            content: protocolClosingPrompt,
          },
          {
            role: "user",
            content: "<respond />",
          },
        ]
      : [];

    formatPrompt &&
      closingPrompts.push({
        role: "developer",
        content: formatPrompt,
      });

    return [...starters, ...previousMessages, ...closingPrompts];
  };

  #toggleReadyToGenerate = () => {
    readyToGenerate = true;
  };

  /**
   * Executes a user utterance using the Protocol System V2.
   * @param   {Object}           props
   * @param   {string}           props.systemPrompt Original system prompt.
   * @param   {string}           props.userMessage  An initial user message to kick off orchestration.
   * @param   {string|undefined} props.formatPrompt Formatting instructions for the final response.
   * @returns {Promise<string>}
   */
  async execute(props) {
    /**
     * The execution loop allows chain of thought
     */
    do {
      const turnExecutionResults = [];
      const content = await this.#execute(this.#getConversationHistory(props));

      if (!content) {
        throw Error("Internal problem. Missing response from LLM Service");
      }

      if (content["final-response"]) {
        return content["final-response"];
      }

      const { target, commands } = content;

      if (!target || !commands) {
        throw Error(
          `Internal problem. LLM response missing properties ${JSON.stringify(
            content,
            null,
            2
          )}`
        );
      }

      if (target === "main") {
        for (const command of commands) {
          switch (command["utility-name"]) {
            case "pass_token": {
              break;
            }

            case "ready": {
              this.#toggleReadyToGenerate();
              break;
            }

            default: {
              console.error("Invalid utility from LLM ", command);
            }
          }
        }
      } else {
        if (this.extensions.some((ext) => ext["name"] === target)) {
          const [extension] = this.extensions.find(
            (ext) => ext["name"] === target
          );
          if (extension) {
            extension.handler({
              commands,
              executionBuffer: turnExecutionResults,
            });
          }
        }
      }

      history.push({ turnExecutionResults, content });
    } while (executing);
  }
}

export const fsExtension = {
  name: "fs",
  prompt: Get_Fs_Extension(),
  handler: async ({ commands, executionBuffer }) => {
    for (const command of commands) {
      switch (command["utility-name"]) {
        case "get_file_structure": {
          const value = await get_file_structure(command["args"][0]);
          executionBuffer.push(
            `
                <reply name="get_file_structure" args="[${
                  command["args"][0]
                }]" />
                  ${JSON.stringify(value, null, 2)}
                </reply />
            `
          );
          break;
        }
        case "read_file": {
          const value = await read_file(command["args"][0]);
          executionBuffer.push(
            `
              <reply name="read_file" args="[${command["args"][0]}]"/>
                ${JSON.stringify(value, null, 2)}
              </reply />
          `
          );
          break;
        }
      }
    }
  },
};

export const thinkingExtension = {
  name: "thinking",
  prompt: Get_Thinking_Extension(),
  handler: async ({ commands, executionBuffer = [] }) => {
    for (const command of commands) {
      switch (command["utility-name"]) {
        case "start_thinking": {
          break;
        }
        case "send_report": {
          break;
        }
        case "push_step": {
          break;
        }
        case "commit_steps": {
          break;
        }
        case "peek_steps": {
          break;
        }
        case "end_thinking": {
          break;
        }
      }
    }
  },
};

/**
 * Based off v2 prompt.
 */
export async function main() {}
