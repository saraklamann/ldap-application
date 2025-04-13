"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LDAPStorage = void 0;
class LDAPStorage {
    constructor() {
        this.users = [];
        this.groups = [];
    }
    addUser(user) {
        this.users.push(user);
    }
    addGroup(group) {
        this.groups.push(group);
    }
    findUserByUsername(username) {
        return this.users.find(user => user.username.toLocaleLowerCase() === username.toLocaleLowerCase());
    }
    findGroupByDescription(groupDescription) {
        return this.groups.find(group => group.description.toLocaleLowerCase() === groupDescription.toLocaleLowerCase());
    }
    modifyUserGroups(username, groupsToAdd, groupsToRemove) {
        const user = this.findUserByUsername(username);
        if (!user) {
            console.log(`O usuário ${username} não foi encontrado.`);
            return;
        }
        groupsToAdd.forEach(groupDescription => {
            const group = this.findGroupByDescription(groupDescription);
            if (group && !user.groups.includes(group.description)) {
                user.groups.push(groupDescription);
                console.log(`O grupo ${groupDescription} foi adicionado ao usuário ${username}.`);
            }
            else if (!group) {
                console.log(`O grupo ${groupDescription} não foi encontrado.`);
            }
        });
        groupsToRemove.forEach(groupDescription => {
            const group = this.findGroupByDescription(groupDescription);
            if (group && user.groups.includes(groupDescription)) {
                const groupIndex = user.groups.indexOf(groupDescription);
                user.groups.splice(groupIndex, 1);
                console.log(`O grupo ${groupDescription} foi removido do usuário ${username}.`);
            }
            else if (!group) {
                console.log(`O grupo ${groupDescription} não foi encontrado.`);
            }
        });
    }
    getGroups() {
        return this.groups;
    }
    getUsers() {
        return this.users;
    }
}
exports.LDAPStorage = LDAPStorage;
