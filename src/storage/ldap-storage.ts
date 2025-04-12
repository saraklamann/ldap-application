import { User } from "../models/user";
import { Group } from "../models/group";

export class LDAPStorage {
    private users: User[] = [];
    private groups: Group[] = [];

    addUser(user: User) {
        this.users.push(user);
    }

    addGroup(group: Group) {
        this.groups.push(group);
    }

    private findUserByUsername(username: string): User | undefined {
        return this.users.find(user => user.username === username);
    }
    
    private findGroupByDescription(groupDescription: string): Group | undefined {
        return this.groups.find(group => group.description === groupDescription);
    }

    public modifyUserGroups(username: string, groupsToAdd: string[], groupsToRemove: string[]): void {
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
          } else if (!group) {
            console.log(`O grupo ${groupDescription} não foi encontrado.`);
          }
        });
      
        groupsToRemove.forEach(groupDescription => {
            const group = this.findGroupByDescription(groupDescription); 

            if (group && user.groups.includes(groupDescription)) {
                const groupIndex = user.groups.indexOf(groupDescription); 
                user.groups.splice(groupIndex, 1);
                console.log(`O grupo ${groupDescription} foi removido do usuário ${username}.`);
            } else if (!group) {
            console.log(`O grupo ${groupDescription} não foi encontrado.`);
            }
        });
    }

    getGroups(): Group[] {
      return this.groups;
    }
    
    getUsers(): User[] {
      return this.users;
    }
}