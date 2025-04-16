import { User } from "../models/user";
import { Group } from "../models/group";
import { execSync } from "child_process";

export class LDAPStorage {
  getGroups(): void {
    try {
      const result = execSync(`ldapsearch -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w admin -b "ou=Groups,dc=openconsult,dc=com,dc=br" "(objectClass=groupOfNames)"`, {
        encoding: "utf-8",
        shell: "bash"
      });
  
      const groupNames = result.split("\n")
        .filter(line => line.startsWith("cn:")) 
        .map(line => line.replace("cn: ", "").trim()); 
  
      console.log("Grupos encontrados no LDAP: \n");
      groupNames.forEach(name => console.log(`- ${name}`));
    } catch (error) {
      console.error("Erro ao buscar grupos do LDAP: ", error);
    }
  }
}