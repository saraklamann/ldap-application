import { DOMParser } from 'xmldom';
import xpath from 'xpath';
import { LDAPStorage } from '../storage/ldap-storage';
import { Group } from '../models/group';

export class GroupXMLProcessor {
    constructor(private storage: LDAPStorage) {}

    process(xmlContent: string){
        const doc = new DOMParser().parseFromString(xmlContent);

        const idNode = xpath.select1('//add-attr[@attr-name="Identificador"]/value', doc) as Node;
        const descNode = xpath.select1('//add-attr[@attr-name="Descricao"]/value', doc) as Node;
    
        if (!idNode || !descNode) {
          console.error('XML Inválido: Atributos do grupo incompletos.');
          return;
        }
    
        const group: Group = {
          id: idNode.textContent?.trim() ?? '',
          description: descNode.textContent?.trim() ?? '',
        };
    
        this.storage.addGroup(group);
      }
}