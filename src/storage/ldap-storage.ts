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

    findUserByUsername(username: string): User | undefined {
        return this.users.find(user => user.username.toLocaleLowerCase() === username.toLocaleLowerCase());
    }
    
    private findGroupById(groupId: string): Group | undefined {
        return this.groups.find(group => group.id.toLocaleLowerCase() === groupId.toLocaleLowerCase());
    }

    public modifyUserGroups(username: string, groupsToAdd: string[], groupsToRemove: string[]): void {
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
          } else if (!group) {
            console.log(`O grupo ${groupId} não foi encontrado.`);
          }
        });
      
        groupsToRemove.forEach(groupId => {
            const group = this.findGroupById(groupId); 

            if (group && user.groups.includes(groupId)) {
              const groupIndex = user.groups.indexOf(groupId); 
              user.groups.splice(groupIndex, 1);
              console.log(`O grupo ${groupId} foi removido do usuário ${username}.`);
            } else if (!group) {
              console.log(`O grupo ${groupId} não foi encontrado.`);
            }
        });
    }

    getGroups(): String[] {
      return this.groups.map(group => group.description);
    }
    
    getUsers(): User[] {
      return this.users;
    }
}