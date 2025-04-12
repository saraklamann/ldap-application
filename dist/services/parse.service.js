"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseService = void 0;
const xmldom_1 = require("xmldom");
class ParseService {
    constructor(storage) {
        this.storage = storage;
    }
    execute(xmlContent) {
        const doc = new xmldom_1.DOMParser().parseFromString(xmlContent, 'text/xml');
        const rootNode = doc.documentElement.nodeName;
        if (rootNode === 'add') {
            const className = doc.documentElement.getAttribute('class-name');
            if (className === 'Grupo') {
                this.handleAddGroup(doc);
            }
            else {
                console.log("Não implementado ainda");
            }
        }
    }
    handleAddGroup(doc) {
        console.log("Adição de grupo");
    }
}
exports.ParseService = ParseService;
