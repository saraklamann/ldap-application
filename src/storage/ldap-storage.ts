import { User } from "../models/user";
import { Group } from "../models/group";
import { isValidName } from "../utils/validations";
import { execSync } from "child_process";

export class LDAPStorage {
    private users: User[] = [];
    private groups: Group[] = [];

    addUser(user: User) {
      const existingUser = this.findUserByUsername(user.username);

      if (!isValidName(user.fullName || user.username)) {
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

    addGroup(group: Group) {
      const existingGroup = this.findGroupById(group.id);

      if (!isValidName(group.id || group.description)) {
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

    private findUserByUsername(username: string): User | undefined {
        return this.users.find(user => user.username.toLocaleLowerCase() === username.toLocaleLowerCase());
    }
    
    findGroupById(groupId: string): Group | undefined {
        return this.groups.find(group => group.id.toLocaleLowerCase() === groupId.toLocaleLowerCase());
    }

    modifyUserGroups(username: string, groupsToAdd: string[], groupsToRemove: string[]): void {
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

    getGroupsFromLDAP(): void {
      try {
        const result = execSync(`ldapsearch -x -LLL -b "dc=openconsult,dc=com,dc=br" "objectClass=posixGroup" cn`, {
          encoding: "utf-8"
        });
    
        const groupNames = result.split("\n")
          .filter(line => line.startsWith("cn:")) 
          .map(line => line.replace("cn: ", "").trim()); 
    
        console.log("Grupos encontrados no LDAP: ");
        groupNames.forEach(name => console.log(`- ${name}`));
      } catch (error) {
        console.error("Erro ao buscar grupos do LDAP: ", error);
      }
    }
    
    getUsersFromLDAP(): void {
      try {
        const result = execSync(`ldapsearch -x -LLL -b "dc=openconsult,dc=com,dc=br" "objectClass=posixAccount" uid memberOf`, {
          encoding: "utf-8"
        });
    
        const lines = result.split("\n");
        let currentUser = "";
        const users: { [uid: string]: string[] } = {};
    
        for (const line of lines) {
          if (line.startsWith("uid: ")) {
            currentUser = line.replace("uid: ", "").trim();
            users[currentUser] = [];
          } else if (line.startsWith("memberOf: ") && currentUser) {
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
      } catch (error) {
        console.error("Erro ao buscar usuários do LDAP: ", error);
      }
    }
    
}