"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xml_reader_1 = require("./utils/xml-reader");
const ldap_storage_1 = require("./storage/ldap-storage");
const parse_service_1 = require("./services/parse.service");
async function main() {
    const storage = new ldap_storage_1.LDAPStorage();
    const parser = new parse_service_1.ParseService(storage);
    const xmlContent = (0, xml_reader_1.readXMLFile)('AddGrupo1.xml');
    console.log(xmlContent);
    parser.execute(xmlContent);
}
main();
