import { readXMLFile } from './utils/xml-reader';
import { LDAPStorage } from './storage/ldap-storage';

async function main() {
  const storage = new LDAPStorage();

  const xmlContent = readXMLFile('AddGrupo1.xml');
  console.log(storage.getGroups());
}

main();
