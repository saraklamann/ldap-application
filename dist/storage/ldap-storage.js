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
        // Adicionar grupos
        groupsToAdd.forEach(groupId => {
            const group = this.findGroupById(groupId);
            if (group && !user.groups.includes(groupId)) {
                user.groups.push(groupId);
                console.log(`O grupo ${groupId} foi adicionado ao usuário ${username}.`);
            }
            else if (!group) {
                console.log(`O grupo ${groupId} não foi encontrado.`);
            }
            else {
                console.log(`O usuário ${username} já está no grupo ${groupId}.`);
            }
        });
        // Remover grupos
        groupsToRemove.forEach(groupId => {
            const group = this.findGroupById(groupId);
            if (group && user.groups.includes(groupId)) {
                user.groups = user.groups.filter(group => group !== groupId); // Remoção mais funcional
                console.log(`O grupo ${groupId} foi removido do usuário ${username}.`);
            }
            else if (!group) {
                console.log(`O grupo ${groupId} não foi encontrado.`);
            }
            else {
                console.log(`O usuário ${username} não pertence ao grupo ${groupId}.`);
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
                const gidNumberLine = lines.find(line => line.startsWith("gidNumber:"));
                const descriptionLine = lines.find(line => line.startsWith("description:"));
                if (cnLine && gidNumberLine && descriptionLine) {
                    const groupName = cnLine.replace("cn: ", "").trim();
                    const gidNumber = gidNumberLine.replace("gidNumber: ", "").trim();
                    const description = descriptionLine.replace("description: ", "").trim();
                    groups.push({ id: groupName, description, gidNumber });
                }
            });
            // Armazena os grupos carregados na memória
            this.groups = groups;
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
            const result = (0, child_process_1.execSync)(`ldapsearch -x -LLL -b "ou=users,dc=openconsult,dc=com,dc=br" "(objectClass=inetOrgPerson)" cn gidNumber phoneNumber`, { encoding: "utf-8" });
            const users = [];
            let currentUser = null;
            result.split("\n").forEach(line => {
                const [key, value] = line.split(":").map(item => item.trim());
                // Quando encontramos o 'cn' (nome do usuário), iniciamos um novo usuário
                if (key === "cn") {
                    // Se o currentUser não for nulo, adicionamos ao array users e reiniciamos
                    if (currentUser) {
                        users.push(currentUser);
                    }
                    // Inicia o novo usuário com valores padrão
                    currentUser = {
                        username: value,
                        fullName: value, // Preenche fullName com o valor de cn
                        phone: "", // Ajuste conforme necessário para telefone
                        groups: [] // Inicializa o array de grupos
                    };
                }
                else if (key === "gidNumber" && currentUser) {
                    const groupName = this.getGroupNameByGid(value); // Mapeia gidNumber para o nome do grupo
                    if (groupName) {
                        currentUser.groups.push(groupName); // Adiciona o grupo ao usuário
                    }
                }
                else if (key === "phoneNumber" && currentUser) {
                    currentUser.phone = value; // Preenche o telefone
                }
            });
            // Adiciona o último usuário se houver
            if (currentUser) {
                users.push(currentUser);
            }
            if (users.length === 0) {
                console.log("Nenhum usuário encontrado no LDAP.");
            }
            else {
                console.log("Usuários encontrados no LDAP:");
                users.forEach(user => {
                    console.log(`- Usuário: ${user.username}`);
                    console.log(`  Nome Completo: ${user.fullName}`);
                    console.log(`  Telefone: ${user.phone}`);
                    console.log(`  Grupos: ${user.groups.join(", ")}`);
                });
            }
        }
        catch (error) {
            console.error("Erro ao buscar usuários do LDAP: ", error);
        }
    }
    // Função para mapear o gidNumber para o nome do grupo
    getGroupNameByGid(gidNumber) {
        const group = this.findGroupByGidNumber(gidNumber); // Busca o grupo pelo gidNumber
        return group ? group.id : undefined; // Retorna o id do grupo (nome) ou undefined
    }
    // Função para encontrar um grupo pelo gidNumber
    findGroupByGidNumber(gidNumber) {
        return this.groups.find(group => group.gidNumber === gidNumber);
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
            const command = `echo -e "dn: cn=${group.id},ou=groups,dc=openconsult,dc=com,dc=br\\nobjectClass: posixGroup\\ncn: ${group.id}\\ngidNumber: ${gidNumber}\\ndescription: ${group.description}" | ldapadd -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w ${process.env.LDAP_ADMIN_PASSWORD}`;
            (0, child_process_1.execSync)(command, { shell: "/bin/bash" });
            this.groups.push(group);
            console.log(`O grupo ${group.description} foi criado com sucesso.`);
        }
        catch (error) {
            console.error("Erro ao adicionar grupo no LDAP: ", error);
        }
    }
    getGidNumberByGroupId(groupId) {
        const group = this.findGroupById(groupId); // Essa função busca o grupo pelo seu ID
        return group ? group.gidNumber : ''; // Retorna o gidNumber associado ao grupo
    }
    addUserToLDAP(user) {
        try {
            const primaryGroupId = user.groups[0];
            const primaryGroup = this.findGroupById(primaryGroupId);
            if (!primaryGroup) {
                console.log(`Grupo primário '${primaryGroupId}' não encontrado para o usuário ${user.username}.`);
                return;
            }
            if (!(0, validations_1.isValidName)(user.username) || !(0, validations_1.isValidName)(user.fullName) || !/^\d+$/.test(user.phone.replace(/\D/g, ''))) {
                console.log("Dados do usuário inválidos.");
                return;
            }
            const uidNumber = this.generateGidNumber("User");
            const phone = user.phone.replace(/\D/g, '');
            const ldifLines = [
                `dn: cn=${user.username},ou=users,dc=openconsult,dc=com,dc=br`,
                `objectClass: inetOrgPerson`,
                `objectClass: posixAccount`,
                `cn: ${user.fullName}`,
                `sn: ${user.fullName.split(' ')[1] || user.fullName}`,
                `uid: ${user.username}`,
                `uidNumber: ${uidNumber}`,
                `gidNumber: ${primaryGroup.gidNumber}`,
                `homeDirectory: /home/${user.username}`,
                `telephoneNumber: ${phone}`
            ];
            const ldif = ldifLines.join('\n');
            const command = `echo "${ldif}" | ldapadd -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w ${process.env.LDAP_ADMIN_PASSWORD}`;
            (0, child_process_1.execSync)(command, { shell: "/bin/bash" });
            console.log(`Usuário ${user.username} adicionado com sucesso!`);
        }
        catch (error) {
            console.error("Erro ao adicionar usuário no LDAP: ", error);
        }
    }
    addMemberToGroup(groupId, username) {
        try {
            const group = this.findGroupById(groupId);
            if (!group) {
                console.log(`Grupo ${groupId} não encontrado.`);
                return;
            }
            const command = `ldapmodify -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w ${process.env.LDAP_ADMIN_PASSWORD} <<EOF
        dn: cn=${groupId},ou=groups,dc=openconsult,dc=com,dc=br
        changetype: modify
        add: memberUid
        memberUid: ${username}
        EOF`;
            (0, child_process_1.execSync)(command, { shell: "/bin/bash" });
            console.log(`Usuário ${username} adicionado ao grupo ${groupId} com sucesso.`);
        }
        catch (error) {
            // Se já for membro, o LDAP pode lançar um erro – tratamos isso abaixo
            if (error instanceof Error &&
                error.message.includes("Type or value exists")) {
                console.log(`Usuário ${username} já é membro do grupo ${groupId}.`);
            }
            else {
                console.error("Erro ao adicionar membro ao grupo: ", error);
            }
        }
    }
}
exports.LDAPStorage = LDAPStorage;
