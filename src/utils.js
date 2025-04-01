import { readdir, stat } from "fs";
import { join } from "path";
import { readFile } from "fs/promises";

/**
 * Reads the content of a file at the given path.
 *
 * @param {string} pathToFile - The path to the file to read.
 * @returns {string} - A promise that resolves with the file content.
 */
export async function readFileContent(pathToFile) {
    try {
        const content = await readFile(pathToFile, "utf-8");
        return content;
    } catch (err) {
        console.error(`Error reading file at ${pathToFile}:`, err);
        throw err;
    }
}

/**
 * Recursively walks through a directory and its subdirectories.
 *
 * @param {string} dirPath - The path to the directory to walk.
 * @param {function(string, import('fs').Stats): void} cb - A callback function invoked for each file or directory found.
 */
export function walkDirectory(dirPath, cb) {
    readdir(dirPath, (err, items) => {
        if (err) {
            console.error("Error reading directory:", err);
            return;
        }

        items.forEach((item) => {
            const itemPath = join(dirPath, item);
            stat(itemPath, (err, stats) => {
                if (err) {
                    console.error(`Error accessing ${itemPath}:`, err);
                    return;
                }

                cb(itemPath, stats);

                if (stats.isDirectory()) {
                    walkDirectory(itemPath, cb);
                }
            });
        });
    });
}
