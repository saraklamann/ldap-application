"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LDAPStorage = void 0;
const child_process_1 = require("child_process");
class LDAPStorage {
    getGroups() {
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
    getUsers() {
        try {
            const result = (0, child_process_1.execSync)(`ldapsearch -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w admin -b "ou=Users,dc=openconsult,dc=com,dc=br" memberOf uid cn telephoneNumber`, {
                encoding: "utf-8",
                shell: "bash"
            });
            const lines = result.split("\n");
            let user = { memberOf: [] };
            let userId = 1;
            lines.forEach((line) => {
                if (line.startsWith("uid:")) {
                    if (user.uid && user.cn) {
                        const groups = user.memberOf.length > 0 ? user.memberOf.join(", ") : "Esse usuário ainda não possui grupos.";
                        console.log(`[${userId}] Usuário: ${user.uid} | Nome completo: ${user.cn} | Telefone: ${user.telephoneNumber} | Grupos: ${groups}`);
                        userId++;
                    }
                    user = { uid: line.replace("uid: ", "").trim(), memberOf: [] };
                }
                if (line.startsWith("cn:")) {
                    user.cn = line.replace("cn: ", "").trim();
                }
                if (line.startsWith("telephoneNumber:")) {
                    user.telephoneNumber = line.replace("telephoneNumber: ", "").trim();
                }
                if (line.startsWith("memberOf:")) {
                    const group = line.replace("memberOf: ", "").trim();
                    const groupName = group.split(",")[0].replace("cn=", "");
                    user.memberOf.push(groupName);
                }
            });
            if (user.uid && user.cn) {
                const groups = user.memberOf.length > 0 ? user.memberOf.join(", ") : "Esse usuário ainda não possui grupos.";
                console.log(`[${userId}] Usuário: ${user.uid} | Nome completo: ${user.cn} | Telefone: ${user.telephoneNumber} | Grupos: ${groups}`);
            }
        }
        catch (error) {
            console.error("Erro ao buscar usuários do LDAP: ", error);
        }
    }
}
exports.LDAPStorage = LDAPStorage;
