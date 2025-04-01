/**
 * @param {string} pathToRepo
 * @returns
 */
const Get_Prompt = (pathToRepo) => `
<instructions>
You're are given with a new repository at ${pathToRepo}. Your task is to generate documentation on the repository.
You're presented with a set of utilities that you can use to perform various operations like reading files, getting file structure etc
</instructions>

<utilities>
get_file_structure(pathToProject). Execution should provide the project's file structure
read_file(pathToFile). Execution should give you the contents of a file at 'pathToFile'
ready(). Executing ready indicates you have enough context to achieve your task
</instructions>

<output>
Return a series of commands
</output>
`;

export default Get_Prompt;
