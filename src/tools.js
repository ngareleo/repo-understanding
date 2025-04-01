import { DirectoryWalk, readFileContent } from "./utils.js";

/**
 * Allows llm to understand a projects file strucure
 * @param {string} pathToFile
 */
export async function get_file_structure(pathToFile) {
    return new Promise((resolve, reject) => {
        let files = [];
        new DirectoryWalk()
            .on("err", (err) => reject(err))
            .on("found", (file) => files.push(file[0]))
            .walkSync(pathToFile);
        resolve(files.join("\n"));
    });
}

export async function read_file(pathToFile) {
    return new Promise((resolve, reject) => {
        readFileContent(pathToFile, (err, contents) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(contents);
        });
    });
}
