import { readXMLFile } from "./utils/xml-reader";
import { LDAPStorage } from "./storage/ldap-storage";
import { ParseService } from "./services/parse.service";

async function main() {
  const storage = new LDAPStorage();
  const parseService = new ParseService(storage);

  const xmlContent = readXMLFile("AddUsuario1.xml"); 

  parseService.execute(xmlContent);
}

main();
