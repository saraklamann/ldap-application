"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseService = void 0;
const xmldom_1 = require("xmldom");
const xpath_1 = __importDefault(require("xpath"));
class ParseService {
    constructor(storage) {
        this.storage = storage;
        this.storage = storage;
    }
    execute(xmlContent) {
        const doc = new xmldom_1.DOMParser().parseFromString(xmlContent, 'text/xml');
        const rootNode = doc.documentElement.nodeName;
        switch (rootNode) {
            case "add":
                const className = doc.documentElement.getAttribute('class-name');
                if (className === 'Grupo') {
                    this.handleAddGroup(doc);
                }
                else {
                    this.handleAddUser(doc);
                }
                break;
            case "remove":
                break;
            default:
                break;
        }
    }
    handleAddGroup(doc) {
        const select = xpath_1.default.useNamespaces({});
        const idNode = select("//add-attr[@attr-name='Identificador']/value/text()", doc)[0];
        const descriptionNode = select("//add-attr[@attr-name='Descricao']/value/text()", doc)[0];
        const groupId = idNode?.nodeValue?.trim() || "";
        const groupDescription = descriptionNode?.nodeValue?.trim() || "";
        if (!groupId || !groupDescription) {
            console.error("Faltam informações sobre o grupo no documento XML.");
            return;
        }
        this.storage.addGroup({ id: groupId, description: groupDescription });
        console.log(`O grupo ${groupDescription} foi criado com sucesso.`);
    }
    handleAddUser(doc) {
        const nameNode = xpath_1.default.select("//add-attr[@attr-name='Nome Completo']/value/text()", doc)[0];
        const loginNode = xpath_1.default.select("//add-attr[@attr-name='Login']/value/text()", doc)[0];
        const phoneNode = xpath_1.default.select("//add-attr[@attr-name='Telefone']/value/text()", doc)[0];
        const groupNodes = xpath_1.default.select("//add-attr[@attr-name='Grupo']/value/text()", doc);
        const userName = nameNode?.nodeValue?.trim() || "";
        const userLogin = loginNode?.nodeValue?.trim() || "";
        const userPhone = phoneNode?.nodeValue?.trim() || "";
        const userGroups = groupNodes.map(node => node.nodeValue?.trim()).filter((value) => value !== undefined);
        if (!userName || !userLogin || !userPhone || !userGroups) {
            console.error("Faltam informações sobre o usuário no documento XML.");
            return;
        }
        this.storage.addUser({ fullName: userName, username: userLogin, phone: userPhone, groups: userGroups });
        console.log(`O usuário ${userName} foi criado com sucesso.`);
    }
}
exports.ParseService = ParseService;
