import { readXMLFile } from "./utils/xml-reader";
import { LDAPStorage } from "./storage/ldap-storage";
import { ParseService } from "./services/parse.service";

async function main() {
  const storage = new LDAPStorage();
  
  storage.addGroup({ id: 'g2', description: 'Grupo2' });
  storage.addGroup({ id: 'g3', description: 'Grupo3' });
  
  storage.addUser({
    fullName: 'Usuario de Teste1',
    username: 'Teste1',
    phone: '(11) 98765-4321',
    groups: ['Grupo2']
  });
  
  const parseService = new ParseService(storage);
  const xmlContent = readXMLFile("ModifyUsuario.xml"); 

  parseService.execute(xmlContent);
}

main();
