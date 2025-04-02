import EventEmitter from "events";
import { readFile, readdirSync, statSync } from "fs";
import { join } from "path";

/**
 * Reads the content of a file at the given path.
 *
 * @param {string} pathToFile - The path to the file to read.
 * @param {function(Error, string)} cb - A callback that takes `contents` when contents of file are available
 * @returns {string} - A promise that resolves with the file content.
 */
export function readFileContent(pathToFile, cb) {
    readFile(pathToFile, "utf-8", (err, data) => {
        if (err) {
            console.error(err);
            cb(err, undefined);
        }
        cb(null, data);
    });
}

export class DirectoryWalk extends EventEmitter {
    constructor() {
        super();
    }

    /**
     * Recursively walks through a directory and its subdirectories.
     * @param {string} dirPath - The path to the directory to walk
     */
    walkSync(dirPath) {
        let paths;
        try {
            paths = readdirSync(dirPath);
        } catch (e) {
            this.emit("error", e);
        }

        for (const item of paths) {
            const itemPath = join(dirPath, item);
            let stat;

            try {
                stat = statSync(itemPath);
            } catch (e) {
                this.emit("error", err);
            }

            this.emit("found", [itemPath, stat]);
            if (stat.isDirectory()) {
                this.walkSync(itemPath);
            }
        }
    }
}
