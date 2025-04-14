"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LDAPStorage = void 0;
const validations_1 = require("../utils/validations");
const child_process_1 = require("child_process");
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
    addGroup(group) {
        const existingGroup = this.findGroupById(group.id);
        if (!(0, validations_1.isValidName)(group.id || group.description)) {
            console.log("O ID de um grupo ou a descrição não podem estar em branco.");
            return;
        }
        if (existingGroup) {
            console.log(`O grupo com ID ${group.id} já existe.`);
            return;
        }
        this.groups.push(group);
        console.log(`O grupo ${group.description} foi criado com sucesso.`);
    }
    findUserByUsername(username) {
        return this.users.find(user => user.username.toLocaleLowerCase() === username.toLocaleLowerCase());
    }
    findGroupById(groupId) {
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
    getGroups() {
        return this.groups.map(group => group.description);
    }
    getUsers() {
        return this.users;
    }
    getGroupsFromLDAP() {
        try {
            const result = (0, child_process_1.execSync)(`ldapsearch -x -LLL -b "dc=openconsult,dc=com,dc=br" "objectClass=posixGroup" cn`, {
                encoding: "utf-8"
            });
            const groupNames = result.split("\n")
                .filter(line => line.startsWith("cn:"))
                .map(line => line.replace("cn: ", "").trim());
            console.log("Grupos encontrados no LDAP: ");
            groupNames.forEach(name => console.log(`- ${name}`));
        }
        catch (error) {
            console.error("Erro ao buscar grupos do LDAP: ", error);
        }
    }
    getUsersFromLDAP() {
        try {
            const result = (0, child_process_1.execSync)(`ldapsearch -x -LLL -b "dc=openconsult,dc=com,dc=br" "objectClass=posixAccount" uid memberOf`, {
                encoding: "utf-8"
            });
            const groupNames = result
                .split("\n")
                .filter(line => line.startsWith("cn:"))
                .map(line => line.replace("cn: ", "").trim());
            console.log("Grupos encontrados no LDAP:");
            groupNames.forEach(name => console.log(`- ${name}`));
        }
        catch (error) {
            console.error("Erro ao buscar usuários do LDAP: ", error);
        }
    }
    generateGidNumber() {
        return (1000 + this.groups.length).toString();
    }
    addGroupsToLDAP(group) {
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
            const ldapAddCommand = `dn: cn=${group.id},ou=groups,dc=openconsult,dc=com,dc=br
        objectClass: posixGroup
        cn: ${group.id}
        gidNumber: 1000
        description: ${group.description}`;
            (0, child_process_1.execSync)(`echo -e "${ldapAddCommand}" | ldapadd -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w Abacaxi10.`);
            this.groups.push(group);
            console.log(`O grupo ${group.description} foi criado com sucesso.`);
        }
        catch (error) {
            console.error("Erro ao adicionar grupo no LDAP: ", error);
        }
    }
}
exports.LDAPStorage = LDAPStorage;
