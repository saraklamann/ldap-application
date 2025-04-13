import { DOMParser } from 'xmldom';
import { LDAPStorage } from '../storage/ldap-storage';
import xpath from 'xpath';

export class ParseService {
    constructor(private storage: LDAPStorage) {
        this.storage = storage;
    }

    execute(xmlContent: string) {
        const doc = new DOMParser().parseFromString(xmlContent, 'text/xml');

        const rootNode = doc.documentElement.nodeName;

        switch(rootNode){
            case "add":
                const className = doc.documentElement.getAttribute('class-name');

                if(className === 'Grupo') {
                    this.handleAddGroup(doc);
                } else {
                    this.handleAddUser(doc)
                }

                break;
            case "modify":
                this.handleModifyUser(doc);
                break;
            default:
                break;
        }
    }

    private handleAddGroup(doc: Document) {
        const select = xpath.useNamespaces({})

        const idNode = (select("//add-attr[@attr-name='Identificador']/value/text()", doc) as Node[])[0];
        const descriptionNode = (select("//add-attr[@attr-name='Descricao']/value/text()", doc) as Node[])[0];

        const groupId = idNode?.nodeValue?.trim() || "";
        const groupDescription = descriptionNode?.nodeValue?.trim() || "";

        if(!groupId || !groupDescription){
            console.error("Faltam informações sobre o grupo no documento XML.");
            return;
        }
        
        this.storage.addGroup({id: groupId, description: groupDescription});
        console.log(`O grupo ${groupDescription} foi criado com sucesso.`);
    }

    private handleAddUser(doc: Document){
        const nameNode = (xpath.select("//add-attr[@attr-name='Nome Completo']/value/text()", doc) as Node[])[0];
        const loginNode = (xpath.select("//add-attr[@attr-name='Login']/value/text()", doc) as Node[])[0];
        const phoneNode = (xpath.select("//add-attr[@attr-name='Telefone']/value/text()", doc) as Node[])[0];
        const groupNodes = xpath.select("//add-attr[@attr-name='Grupo']/value/text()", doc) as Node[];

        const userName = nameNode?.nodeValue?.trim() || "";
        const userLogin = loginNode?.nodeValue?.trim() || "";
        const userPhone = phoneNode?.nodeValue?.trim() || "";
        const userGroups = groupNodes.map(node => node.nodeValue?.trim()).filter((value): value is string => value !== undefined);

        if(!userName || !userLogin || !userPhone || !userGroups){
            console.error("Faltam informações sobre o usuário no documento XML.");
            return;
        }

        this.storage.addUser({fullName: userName, username: userLogin, phone: userPhone, groups: userGroups});
        console.log(`O usuário ${userName} foi criado com sucesso.`);
    }

    private handleModifyUser(doc: Document){
        const select = xpath.useNamespaces({});

        const userNode = (select("//modify/association[@state='associated']/text()", doc) as Node[])[0];
        const userLogin = userNode?.nodeValue?.trim() || "";

        if(!userLogin){
            console.error("Não foi possível encontrar o nome do usuário no documento XML.");
            return;
        }

        const removeGroupNodes = select("//modify-attr[@attr-name='Grupo']/remove-value/value/text()", doc) as Node[];
        const addGroupNodes = select("//modify-attr[@attr-name='Grupo']/add-value/value/text()", doc) as Node[];

        const groupsToRemove = removeGroupNodes.map(node => node.nodeValue?.trim()).filter((value): value is string => value !== undefined);
        const groupsToAdd = addGroupNodes.map(node => node.nodeValue?.trim()).filter((value): value is string => value !== undefined);

        this.storage.modifyUserGroups(userLogin, groupsToAdd, groupsToRemove);
    }
}