import fs from "fs";
import path from "path";

export function readXMLFile(filename: string): string {
    const filePath = path.join(__dirname, "..", "xml", filename);
    return fs.readFileSync(filePath, "utf-8");
}