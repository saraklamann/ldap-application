"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xml_reader_1 = require("./utils/xml-reader");
const ldap_storage_1 = require("./storage/ldap-storage");
async function main() {
    const storage = new ldap_storage_1.LDAPStorage();
    const xmlContent = (0, xml_reader_1.readXMLFile)('AddGrupo1.xml');
    console.log(xmlContent);
}
main();
