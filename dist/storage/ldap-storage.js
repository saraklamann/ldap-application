"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LDAPStorage = void 0;
const child_process_1 = require("child_process");
class LDAPStorage {
    getUsersFromLDAP() {
        try {
            const result = (0, child_process_1.execSync)(`ldapsearch -x -LLL -b "dc=openconsult,dc=com,dc=br" "objectClass=posixAccount" uid memberOf`, {
                encoding: "utf-8"
            });
            const lines = result.split("\n");
            let currentUser = "";
            const users = {};
            for (const line of lines) {
                if (line.startsWith("uid: ")) {
                    currentUser = line.replace("uid: ", "").trim();
                    users[currentUser] = [];
                }
                else if (line.startsWith("memberOf: ") && currentUser) {
                    const groupDN = line.replace("memberOf: ", "").trim();
                    const cnMatch = groupDN.match(/cn=([^,]+)/i);
                    if (cnMatch) {
                        users[currentUser].push(cnMatch[1]);
                    }
                }
            }
            console.log("Usuários encontrados no LDAP:");
            for (const [uid, groups] of Object.entries(users)) {
                console.log(`- ${uid}${groups.length ? ` (Grupos: ${groups.join(", ")})` : ""}`);
            }
        }
        catch (error) {
            console.error("Erro ao buscar usuários do LDAP: ", error);
        }
    }
}
exports.LDAPStorage = LDAPStorage;
