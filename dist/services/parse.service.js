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
                    this.handleAddGroup(doc);
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
                    this.handleModifyUser(doc);
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
        const cleanedGroupUid = groupId.replace(/[^a-zA-Z0-9]/g, "");
        const cleanedGroupDescription = groupDescription.replace(/[^a-zA-Z0-9 ]/g, "");
        this.storage.addGroup({ cn_id: cleanedGroupUid, description: cleanedGroupDescription, member: [] });
    }
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
        const cleanedName = fullname.replace(/[^a-zA-Z\s]/g, "");
        const cleanedUsername = username.replace(/[^a-zA-Z0-9]/g, "");
        const cleanedPhone = userPhone.replace(/\D/g, "");
        this.storage.addUser({ cn_fullName: cleanedName, uid_username: cleanedUsername, phone: cleanedPhone, groups: userGroups });
    }
    handleModifyUser(doc) {
        const select = xpath_1.default.useNamespaces({});
        const userNode = select("//modify/association[@state='associated']/text()", doc)[0];
        const username = userNode?.nodeValue?.trim() || "";
        if (!username) {
            console.error("Não foi possível encontrar o nome do usuário no documento XML.");
            return;
        }
        const removeGroupNodes = select("//modify-attr[@attr-name='Grupo']/remove-value/value/text()", doc);
        const addGroupNodes = select("//modify-attr[@attr-name='Grupo']/add-value/value/text()", doc);
        const groupsToRemove = removeGroupNodes.map(node => node.nodeValue?.trim()).filter((value) => value !== undefined);
        const groupsToAdd = addGroupNodes.map(node => node.nodeValue?.trim()).filter((value) => value !== undefined);
        this.storage.modifyUserGroups(username, groupsToAdd, groupsToRemove);
    }
}
exports.ParseService = ParseService;
