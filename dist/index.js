"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xml_reader_1 = require("./utils/xml-reader");
const ldap_storage_1 = require("./storage/ldap-storage");
const parse_service_1 = require("./services/parse.service");
async function main() {
    const storage = new ldap_storage_1.LDAPStorage();
    storage.addGroup({ id: 'g2', description: 'Grupo2' });
    storage.addGroup({ id: 'g3', description: 'Grupo3' });
    storage.addUser({
        fullName: 'Usuario de Teste1',
        username: 'Teste1',
        phone: '(11) 98765-4321',
        groups: ['Grupo2']
    });
    const parseService = new parse_service_1.ParseService(storage);
    const xmlContent = (0, xml_reader_1.readXMLFile)("ModifyUsuario.xml");
    parseService.execute(xmlContent);
}
main();
