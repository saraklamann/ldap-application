"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LDAPStorage = void 0;
const child_process_1 = require("child_process");
class LDAPStorage {
    getGroupsFromLDAP() {
        try {
            const result = (0, child_process_1.execSync)(`ldapsearch -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w admin -b "ou=Groups,dc=openconsult,dc=com,dc=br" "(objectClass=groupOfNames)"`, {
                encoding: "utf-8",
                shell: "bash"
            });
            const groupNames = result.split("\n")
                .filter(line => line.startsWith("cn:"))
                .map(line => line.replace("cn: ", "").trim());
            console.log("Grupos encontrados no LDAP: \n");
            groupNames.forEach(name => console.log(`- ${name}`));
        }
        catch (error) {
            console.error("Erro ao buscar grupos do LDAP: ", error);
        }
    }
}
exports.LDAPStorage = LDAPStorage;
