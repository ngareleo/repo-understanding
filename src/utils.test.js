import { jest } from "@jest/globals";
import EventEmitter from "events";
import fs from "fs";
import path from "path";
import { readFileContent, DirectoryWalk } from "./your-module";

// Mock fs and path modules
jest.mock("fs");
jest.mock("path");

describe("readFileContent", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should read file content successfully", () => {
        // Arrange
        const pathToFile = "/path/to/file.txt";
        const fileContent = "test file content";
        const callback = jest.fn();

        // Mock implementation
        fs.readFile.mockImplementation((path, encoding, cb) => {
            cb(null, fileContent);
        });

        // Act
        readFileContent(pathToFile, callback);

        // Assert
        expect(fs.readFile).toHaveBeenCalledWith(
            pathToFile,
            "utf-8",
            expect.any(Function)
        );
        expect(callback).toHaveBeenCalledWith(null, fileContent);
    });

    test("should handle errors when reading file", () => {
        // Arrange
        const pathToFile = "/path/to/nonexistent.txt";
        const expectedError = new Error("File not found");
        const callback = jest.fn();

        // Mock console.error
        console.error = jest.fn();

        // Mock implementation
        fs.readFile.mockImplementation((path, encoding, cb) => {
            cb(expectedError, undefined);
        });

        // Act
        readFileContent(pathToFile, callback);

        // Assert
        expect(fs.readFile).toHaveBeenCalledWith(
            pathToFile,
            "utf-8",
            expect.any(Function)
        );
        expect(console.error).toHaveBeenCalledWith(expectedError);
        expect(callback).toHaveBeenCalledWith(expectedError, undefined);
    });
});

describe("DirectoryWalk", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock path.join to simply concatenate paths with a slash
        path.join.mockImplementation((dir, file) => `${dir}/${file}`);
    });

    test('should emit "found" event for each file or directory', () => {
        // Arrange
        const directoryPath = "/test/dir";
        const items = ["file1.txt", "folder1", "file2.js"];

        const stats = {
            file1: { isDirectory: () => false },
            folder1: { isDirectory: () => true },
            file2: { isDirectory: () => false },
        };

        fs.readdirSync.mockImplementation((dirPath) => {
            if (dirPath === directoryPath) return items;
            if (dirPath === `${directoryPath}/folder1`) return []; // Empty folder
            throw new Error("Unexpected directory");
        });

        fs.statSync.mockImplementation((itemPath) => {
            if (itemPath === `${directoryPath}/file1.txt`) return stats.file1;
            if (itemPath === `${directoryPath}/folder1`) return stats.folder1;
            if (itemPath === `${directoryPath}/file2.js`) return stats.file2;
            throw new Error(`Unexpected path: ${itemPath}`);
        });

        const directoryWalk = new DirectoryWalk();
        const foundSpy = jest.spyOn(directoryWalk, "emit");

        // Act
        directoryWalk.walkSync(directoryPath);

        // Assert
        expect(fs.readdirSync).toHaveBeenCalledWith(directoryPath);
        expect(fs.readdirSync).toHaveBeenCalledWith(`${directoryPath}/folder1`);

        // Should emit "found" for each file/directory
        expect(foundSpy).toHaveBeenCalledWith("found", [
            `${directoryPath}/file1.txt`,
            stats.file1,
        ]);
        expect(foundSpy).toHaveBeenCalledWith("found", [
            `${directoryPath}/folder1`,
            stats.folder1,
        ]);
        expect(foundSpy).toHaveBeenCalledWith("found", [
            `${directoryPath}/file2.js`,
            stats.file2,
        ]);
    });

    test('should emit "error" when readdirSync fails', () => {
        // Arrange
        const directoryPath = "/nonexistent/dir";
        const expectedError = new Error("Directory not found");

        // Mock implementation
        fs.readdirSync.mockImplementation(() => {
            throw expectedError;
        });

        const directoryWalk = new DirectoryWalk();
        const errorSpy = jest.spyOn(directoryWalk, "emit");

        // Act
        directoryWalk.walkSync(directoryPath);

        // Assert
        expect(fs.readdirSync).toHaveBeenCalledWith(directoryPath);
        expect(errorSpy).toHaveBeenCalledWith("error", expectedError);
    });

    test('should emit "error" when statSync fails', () => {
        // Arrange
        const directoryPath = "/test/dir";
        const items = ["problem-file.txt"];
        const expectedError = new Error("Could not read file stats");

        // Mock implementations
        fs.readdirSync.mockReturnValue(items);
        fs.statSync.mockImplementation(() => {
            throw expectedError;
        });

        const directoryWalk = new DirectoryWalk();
        const errorSpy = jest.spyOn(directoryWalk, "emit");

        // Act
        directoryWalk.walkSync(directoryPath);

        // Assert
        expect(fs.readdirSync).toHaveBeenCalledWith(directoryPath);
        expect(fs.statSync).toHaveBeenCalledWith(
            `${directoryPath}/problem-file.txt`
        );
        expect(errorSpy).toHaveBeenCalledWith("error", expect.any(Error));
    });

    test("should recursively walk through nested directories", () => {
        // Arrange
        const rootDir = "/root";
        const level1Dir = `${rootDir}/level1`;
        const level2Dir = `${level1Dir}/level2`;

        const fileStructure = {
            [rootDir]: ["file1.txt", "level1"],
            [level1Dir]: ["file2.txt", "level2"],
            [level2Dir]: ["file3.txt"],
        };

        const stats = {
            file: { isDirectory: () => false },
            directory: { isDirectory: () => true },
        };

        fs.readdirSync.mockImplementation((dirPath) => {
            return fileStructure[dirPath] || [];
        });

        fs.statSync.mockImplementation((itemPath) => {
            const basename = path.basename(itemPath);
            return basename.includes(".txt") ? stats.file : stats.directory;
        });

        const directoryWalk = new DirectoryWalk();
        const emitSpy = jest.spyOn(directoryWalk, "emit");

        // Act
        directoryWalk.walkSync(rootDir);

        // Assert
        // Check if readdirSync was called for all directories
        expect(fs.readdirSync).toHaveBeenCalledWith(rootDir);
        expect(fs.readdirSync).toHaveBeenCalledWith(level1Dir);
        expect(fs.readdirSync).toHaveBeenCalledWith(level2Dir);

        // Check if found events were emitted for all items
        expect(emitSpy).toHaveBeenCalledWith("found", [
            `${rootDir}/file1.txt`,
            stats.file,
        ]);
        expect(emitSpy).toHaveBeenCalledWith("found", [
            `${rootDir}/level1`,
            stats.directory,
        ]);
        expect(emitSpy).toHaveBeenCalledWith("found", [
            `${level1Dir}/file2.txt`,
            stats.file,
        ]);
        expect(emitSpy).toHaveBeenCalledWith("found", [
            `${level1Dir}/level2`,
            stats.directory,
        ]);
        expect(emitSpy).toHaveBeenCalledWith("found", [
            `${level2Dir}/file3.txt`,
            stats.file,
        ]);
    });
});
