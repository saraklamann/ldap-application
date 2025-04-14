"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LDAPStorage = void 0;
const validations_1 = require("../utils/validations");
const child_process_1 = require("child_process");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class LDAPStorage {
    constructor() {
        this.users = [];
        this.groups = [];
    }
    addUser(user) {
        const existingUser = this.findUserByUsername(user.username);
        if (!(0, validations_1.isValidName)(user.fullName || user.username)) {
            console.log("Nome do usuário ou nome completo não podem estar em branco.");
            return;
        }
        if (existingUser) {
            console.log(`O nome de usuário ${user.username} já existe.`);
            return;
        }
        this.users.push(user);
        console.log(`O usuário ${user.username} foi criado com sucesso.`);
    }
    findUserByUsername(username) {
        return this.users.find(user => user.username.toLocaleLowerCase() === username.toLocaleLowerCase());
    }
    findGroupById(groupId) {
        if (this.groups.length === 0) {
            this.groups = this.getGroupsFromLDAP();
        }
        return this.groups.find(group => group.id.toLocaleLowerCase() === groupId.toLocaleLowerCase());
    }
    modifyUserGroups(username, groupsToAdd, groupsToRemove) {
        const user = this.findUserByUsername(username);
        if (!user) {
            console.log(`O usuário ${username} não foi encontrado.`);
            return;
        }
        groupsToAdd.forEach(groupId => {
            const group = this.findGroupById(groupId);
            if (group && !user.groups.includes(group.id)) {
                user.groups.push(groupId);
                console.log(`O grupo ${groupId} foi adicionado ao usuário ${username}.`);
            }
            else if (!group) {
                console.log(`O grupo ${groupId} não foi encontrado.`);
            }
        });
        groupsToRemove.forEach(groupId => {
            const group = this.findGroupById(groupId);
            if (group && user.groups.includes(groupId)) {
                const groupIndex = user.groups.indexOf(groupId);
                user.groups.splice(groupIndex, 1);
                console.log(`O grupo ${groupId} foi removido do usuário ${username}.`);
            }
            else if (!group) {
                console.log(`O grupo ${groupId} não foi encontrado.`);
            }
        });
    }
    getGroupsFromLDAP() {
        const groups = [];
        try {
            const result = (0, child_process_1.execSync)(`ldapsearch -x -LLL -b "dc=openconsult,dc=com,dc=br" "(objectClass=posixGroup)" cn gidNumber description`, { encoding: "utf-8" });
            const groupEntries = result.split("\n\n");
            groupEntries.forEach(entry => {
                const lines = entry.split("\n");
                const cnLine = lines.find(line => line.startsWith("cn:"));
                const descriptionLine = lines.find(line => line.startsWith("description:"));
                if (cnLine && descriptionLine) {
                    const groupName = cnLine.replace("cn: ", "").trim();
                    const description = descriptionLine.replace("description: ", "").trim();
                    groups.push({ id: groupName, description });
                }
            });
            if (groups.length === 0) {
                console.log("Nenhum grupo encontrado no LDAP.");
            }
            else {
                console.log("Grupos encontrados no LDAP:");
                groups.forEach(group => console.log(`- ${group.description}`));
            }
        }
        catch (error) {
            console.error("Erro ao buscar grupos do LDAP: ", error);
        }
        return groups;
    }
    getUsersFromLDAP() {
        try {
            const result = (0, child_process_1.execSync)(`ldapsearch -x -LLL -b "ou=users,dc=openconsult,dc=com,dc=br" "(objectClass=inetOrgPerson)" cn uid`, { encoding: "utf-8" });
            // Extrai o nome (cn) e o uid dos usuários encontrados
            const userNames = result
                .split("\n")
                .filter(line => line.startsWith("cn:") || line.startsWith("uid:"))
                .reduce((acc, line) => {
                const [key, value] = line.split(":").map(str => str.trim());
                if (key === "cn")
                    acc.push({
                        cn: value,
                        uid: ""
                    });
                if (key === "uid" && acc.length > 0)
                    acc[acc.length - 1].uid = value;
                return acc;
            }, []);
            if (userNames.length === 0) {
                console.log("Nenhum usuário encontrado no LDAP.");
            }
            else {
                console.log("Usuários encontrados no LDAP:");
                userNames.forEach(user => console.log(`- ${user.cn} (UID: ${user.uid})`));
            }
        }
        catch (error) {
            console.error("Erro ao buscar usuários do LDAP: ", error);
        }
    }
    generateGidNumber(type) {
        return type === "Group" ? (1000 + this.groups.length).toString() : (1000 + this.users.length).toString();
    }
    addGroupToLDAP(group) {
        try {
            const existingGroup = this.findGroupById(group.id);
            if (!(0, validations_1.isValidName)(group.id || group.description)) {
                console.log("O ID de um grupo ou a descrição não podem estar em branco.");
                return;
            }
            if (existingGroup) {
                console.log(`O grupo com ID ${group.id} já existe.`);
                return;
            }
            const gidNumber = this.generateGidNumber("Group");
            const command = `echo -e "dn: cn=${group.id},ou=groups,dc=openconsult,dc=com,dc=br\\nobjectClass: posixGroup\\ncn: ${group.id}\\ngidNumber: ${gidNumber}\\ndescription: ${group.description}" | ldapadd -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w ${process.env.LDAP_ADMIN_PASSWORD}.`;
            (0, child_process_1.execSync)(command, { shell: "/bin/bash" });
            this.groups.push(group);
            console.log(`O grupo ${group.description} foi criado com sucesso.`);
        }
        catch (error) {
            console.error("Erro ao adicionar grupo no LDAP: ", error);
        }
    }
    addUserToLDAP(user) {
        try {
            // const groupsDNs = user.groups.map(groupId => `cn=${groupId},ou=groups,dc=openconsult,dc=com,dc=br`).join(" ");
            const gidNumber = this.generateGidNumber("User");
            // Gerar o comando de adição de usuário no formato LDIF
            const command = `echo -e "dn: cn=${user.username},ou=users,dc=openconsult,dc=com,dc=br\\nobjectClass: inetOrgPerson\\ncn: ${user.fullName}\\nsn: ${user.fullName.split(' ')[1] || ''}\\nuid: ${user.username}\\ntelephoneNumber: ${user.phone}" | ldapadd -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w ${process.env.LDAP_ADMIN_PASSWORD}`;
            // Executar o comando no shell
            (0, child_process_1.execSync)(command, { shell: "/bin/bash" });
            const groupsString = user.groups
                .map(group => `cn=${group},ou=groups,dc=openconsult,dc=com,dc=br`)
                .join(' '); // Junta todos os grupos em uma única string separada por espaços
            const addUserToGroupsCommand = `echo -e "dn: cn=${user.username},ou=users,dc=openconsult,dc=com,dc=br\\nobjectClass: inetOrgPerson\\ncn: ${user.fullName}\\nsn: ${user.fullName.split(' ')[1] || ''}\\nuid: ${user.username}\\ntelephoneNumber: ${user.phone}\\nmemberOf: ${groupsString}" | ldapadd -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w ${process.env.LDAP_ADMIN_PASSWORD}`;
            (0, child_process_1.execSync)(addUserToGroupsCommand, { shell: "/bin/bash" });
            console.log(`Usuário ${user.username} adicionado com sucesso!`);
        }
        catch (error) {
            console.error("Erro ao adicionar usuário no LDAP: ", error);
        }
    }
}
exports.LDAPStorage = LDAPStorage;
