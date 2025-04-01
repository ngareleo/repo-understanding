import { readFileContent, walkDirectory } from "./utils.js";

/**
 * Allows llm to understand a projects file strucure
 * @param {string} pathToFile
 */
export function get_file_structure(pathToFile) {
    let files = [];
    walkDirectory(pathToFile, (path, _) => {
        files.push(path);
    });
    console.log({ files });
    return files.reduce("", (prev, curr) => (prev += "\n" + curr));
}

export function read_file(pathToFile) {
    return readFileContent(pathToFile);
}
