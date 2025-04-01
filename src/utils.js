import { readdir, stat } from "fs";
import { join } from "path";

/**
 * Recursively walks through a directory and its subdirectories
 * @param {string} dirPath - Path to the directory to walk
 * @param {function} cb - Function to call for each file/directory found
 *                             Gets passed (filePath, stats) as arguments
 */
function walkDirectory(dirPath, cb) {
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
