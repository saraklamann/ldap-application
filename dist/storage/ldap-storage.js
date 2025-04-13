"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LDAPStorage = void 0;
const validations_1 = require("../utils/validations");
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
}
exports.LDAPStorage = LDAPStorage;
