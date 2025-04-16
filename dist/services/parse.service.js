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
        const className = doc.documentElement.getAttribute("class-name");
        switch (rootNode) {
            case "add":
                if (className === "Grupo") {
                    // this.handleAddGroup(doc);
                }
                else if (className === "Usuario") {
                    this.handleAddUser(doc);
                }
                else {
                    console.log(`Não foi possível encontrar a entidade ${className}.`);
                }
                break;
            case "modify":
                if (className === "Usuario") {
                    // this.handleModifyUser(doc);
                }
                else {
                    console.log(`Método não implementado para a entidade ${className}.`);
                }
                break;
            default:
                console.log("Método não implementado.");
                break;
        }
    }
    // private handleAddGroup(doc: Document) {
    //     const select = xpath.useNamespaces({})
    //     const idNode = (select("//add-attr[@attr-name='Identificador']/value/text()", doc) as Node[])[0];
    //     const descriptionNode = (select("//add-attr[@attr-name='Descricao']/value/text()", doc) as Node[])[0];
    //     const groupId = idNode?.nodeValue?.trim() || "";
    //     const groupDescription = descriptionNode?.nodeValue?.trim() || "";
    //     if(!groupId || !groupDescription){
    //         console.error("Faltam informações sobre o grupo no documento XML.");
    //         return;
    //     }
    //     this.storage.addGroup({id: groupId, description: groupDescription});
    // }
    handleAddUser(doc) {
        const nameNode = xpath_1.default.select("//add-attr[@attr-name='Nome Completo']/value/text()", doc)[0];
        const loginNode = xpath_1.default.select("//add-attr[@attr-name='Login']/value/text()", doc)[0];
        const phoneNode = xpath_1.default.select("//add-attr[@attr-name='Telefone']/value/text()", doc)[0];
        const groupNodes = xpath_1.default.select("//add-attr[@attr-name='Grupo']/value/text()", doc);
        const fullname = nameNode?.nodeValue?.trim() || "";
        const username = loginNode?.nodeValue?.trim() || "";
        const userPhone = phoneNode?.nodeValue?.trim() || "";
        const userGroups = groupNodes.map(node => node.nodeValue?.trim()).filter((value) => value !== undefined);
        if (!fullname || !username || !userPhone) {
            console.error("Faltam informações sobre o usuário no documento XML.");
            return;
        }
        // const invalidGroups = userGroups.filter(groupId => !this.storage.findGroupById(groupId));
        // if (invalidGroups.length > 0) {
        //     console.error(`Os seguintes grupos não existem: ${invalidGroups.join(", ")}`);
        //     return;
        // } 
        this.storage.addUser({ cn_fullName: fullname, uid_username: username, phone: userPhone, groups: userGroups });
    }
}
exports.ParseService = ParseService;
