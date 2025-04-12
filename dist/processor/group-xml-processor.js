"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupXMLProcessor = void 0;
const xmldom_1 = require("xmldom");
const xpath_1 = __importDefault(require("xpath"));
class GroupXMLProcessor {
    constructor(storage) {
        this.storage = storage;
    }
    process(xmlContent) {
        const doc = new xmldom_1.DOMParser().parseFromString(xmlContent);
        const idNode = xpath_1.default.select1('//add-attr[@attr-name="Identificador"]/value', doc);
        const descNode = xpath_1.default.select1('//add-attr[@attr-name="Descricao"]/value', doc);
        if (!idNode || !descNode) {
            console.error('XML Inválido: Atributos do grupo incompletos.');
            return;
        }
        const group = {
            id: idNode.textContent?.trim() ?? '',
            description: descNode.textContent?.trim() ?? '',
        };
        this.storage.addGroup(group);
    }
}
exports.GroupXMLProcessor = GroupXMLProcessor;
