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
    addUser(user) {
        const url = `ldapadd -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w admin`;
        const dn = `dn: uid=${user.uid_username},ou=Users,dc=openconsult,dc=com,dc=br`;
        const ldifContent = `
objectClass: inetOrgPerson
objectClass: posixAccount
objectClass: top
uid: urltest-structure
cn: ${user.cn_fullName}
sn: name
uidNumber: 1001
gidNumber: 1001
homeDirectory: /home/johndoe
loginShell: /bin/bash
telephoneNumber: ${user.phone}`; // Melhorar se sobrar tempo
        try {
            (0, child_process_1.execSync)(url, {
                input: dn + ldifContent, // Melhorar se sobrar tempo
                encoding: "utf-8",
                shell: "bash"
            });
            user.groups.length > 0 ? this.addUserToGroup(user.uid_username, user.groups) : "";
            console.log(`O usuário ${user.uid_username} foi adicionado com sucesso!`);
        }
        catch (error) {
            console.error("Erro ao adicionar usuário ao LDAP: ", error);
        }
    }
    addUserToGroup(userId, groups) {
        try {
            groups.forEach(cn => {
                (0, child_process_1.execSync)(`
ldapmodify -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w admin <<EOF
dn: cn=${cn},ou=Groups,dc=openconsult,dc=com,dc=br
changetype: modify
add: member
member: uid=${userId},ou=Users,dc=openconsult,dc=com,dc=br
EOF`, { encoding: "utf-8", shell: "bash" });
                console.log(`Grupo ${cn} adicionado com sucesso!`);
            });
        }
        catch (error) {
            console.error("Erro ao adicionar usuário ao grupo.", error);
        }
    }
}
exports.LDAPStorage = LDAPStorage;
