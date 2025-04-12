import fs from "fs";
import path from "path";

export function readXMLFile(filename: string): string {
    const xmlDirectory = path.join(__dirname, "..", "..", "src", "xml");
    const filePath = path.join(xmlDirectory, filename);
    return fs.readFileSync(filePath, "utf-8");
}