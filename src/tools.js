import { DirectoryWalk, readFileContent } from "./utils.js";

/**
 * Allows llm to understand a projects file strucure
 * @param {string} pathToFile Path to project
 * @returns                   Line separated list of file paths within project
 */
export async function get_file_structure(pathToFile) {
  return new Promise((resolve, reject) => {
    let files = [];
    new DirectoryWalk()
      .on("err", (err) => reject(err))
      .on("found", ([path]) => files.push(path))
      .walkSync(pathToFile);
    resolve(files.join("\n"));
  });
}

/**
 * Allows llm to read a file from file system
 * @param   {string}          pathToFile Path to file
 * @returns {Promise<string>}            Contents of file
 */
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
