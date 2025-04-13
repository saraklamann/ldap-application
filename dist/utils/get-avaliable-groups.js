"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableGroupDescriptions = getAvailableGroupDescriptions;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const xmldom_1 = require("xmldom");
const xpath_1 = __importDefault(require("xpath"));
function getAvailableGroupDescriptions() {
    const xmlDir = path_1.default.join(__dirname, "..", "..", "src", 'xml');
    const files = fs_1.default.readdirSync(xmlDir);
    const groupDescriptions = [];
    for (const file of files) {
        if (file.startsWith('AddGrupo') && file.endsWith('.xml')) {
            const content = fs_1.default.readFileSync(path_1.default.join(xmlDir, file), 'utf-8');
            const doc = new xmldom_1.DOMParser().parseFromString(content, 'text/xml');
            const className = doc.documentElement.getAttribute('class-name');
            if (className === 'Grupo') {
                const descriptionNode = xpath_1.default.select("//add-attr[@attr-name='Descricao']/value/text()", doc)[0];
                const description = descriptionNode?.nodeValue?.trim();
                if (description) {
                    groupDescriptions.push(description);
                }
            }
        }
    }
    return groupDescriptions;
}
