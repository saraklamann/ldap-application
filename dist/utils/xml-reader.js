"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readXMLFile = readXMLFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function readXMLFile(filename) {
    const filePath = path_1.default.join(__dirname, "..", "xml", filename);
    return fs_1.default.readFileSync(filePath, "utf-8");
}
