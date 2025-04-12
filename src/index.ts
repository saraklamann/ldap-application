import { readXMLFile } from './utils/xml-reader';
import { LDAPStorage } from './storage/ldap-storage';
import { ParseService } from './services/parse.service';

async function main() {
  const storage = new LDAPStorage();
  const parser = new ParseService(storage);

  const xmlContent = readXMLFile('AddGrupo1.xml');
  console.log(xmlContent);
  parser.execute(xmlContent);
}

main();
