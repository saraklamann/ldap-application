import { DOMParser } from 'xmldom';
import { LDAPStorage } from '../storage/ldap-storage';
import xpath from 'xpath';

export class ParseService {
    constructor(private storage: LDAPStorage) {}

    execute(xmlContent: string) {
        const doc = new DOMParser().parseFromString(xmlContent, 'text/xml');

        const rootNode = doc.documentElement.nodeName;

        if(rootNode === 'add'){
            const className = doc.documentElement.getAttribute('class-name');
            if(className === 'Grupo') {
                this.handleAddGroup(doc);
            } else {
                console.log("Não implementado ainda");
            }
        }
    }

    private handleAddGroup(doc: Document) {
        console.log("Adição de grupo");
    }
}