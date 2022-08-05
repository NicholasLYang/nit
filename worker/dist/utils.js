"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLineOffset = exports.fileExists = exports.Language = exports.getCLIDirectory = void 0;
const tslib_1 = require("tslib");
const node_path_1 = tslib_1.__importDefault(require("node:path"));
const node_os_1 = require("node:os");
const promises_1 = require("node:fs/promises");
async function getCLIDirectory() {
    const dirPath = node_path_1.default.join((0, node_os_1.homedir)(), ".nit");
    try {
        await (0, promises_1.access)(dirPath);
    }
    catch {
        await (0, promises_1.mkdir)(dirPath);
    }
    return dirPath;
}
exports.getCLIDirectory = getCLIDirectory;
var Language;
(function (Language) {
    Language["Rust"] = "rust";
})(Language = exports.Language || (exports.Language = {}));
async function fileExists(path) {
    try {
        await (0, promises_1.access)(path);
        return true;
    }
    catch {
        return false;
    }
}
exports.fileExists = fileExists;
function getLineOffset(text, lineNumber) {
    for (let i = 0; i < text.length; i++) {
        if (lineNumber === 0) {
            return i;
        }
        if (text[i] === "\n") {
            lineNumber -= 1;
        }
    }
    if (lineNumber === 0) {
        return text.length - 1;
    }
    else {
        throw new Error("Invalid line number: " + lineNumber);
    }
}
exports.getLineOffset = getLineOffset;
