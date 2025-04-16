import { User } from "../models/user";
import { Group } from "../models/group";
import { execSync } from "child_process";
import dotenv from "dotenv";
dotenv.config();

export class LDAPStorage {

  getGroups(): Group[] {
    try {
      const result = execSync(`ldapsearch -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w ${process.env.LDAP_ADMIN_PASSWORD} -b "ou=Groups,dc=openconsult,dc=com,dc=br" "(objectClass=groupOfNames)"`, {
        encoding: "utf-8",
        shell: "bash"
      });

      const groupBlocks = result.split("\n\n"); 

      const groups = groupBlocks.map(block => {
        const lines = block.split("\n");
        let cn_id = "";
        let description = "";
        let members: string[] = []
      
        lines.forEach(line => {
          if (line.startsWith("cn: ")) {
            cn_id = line.replace("cn: ", "").trim(); 
          } else if (line.startsWith("description: ")) {
            description = line.replace("description: ", "").trim(); 
          } else if (line.startsWith("member: ")) {
            const member = line.replace("member: ", "").trim(); 
            members.push(member); 
          }
        });

        if (cn_id) {
          return { cn_id, description, member: members }; 
        }
      }).filter(g => g !== undefined); 
      let groupId = 1;

      console.log("\n----------- GRUPOS ----------- \n");
      groups.forEach(group => {
        console.log(`[${groupId}] ${group.cn_id} | ${group.description}`)
        groupId++
      });

      return groups
    } catch (error) {
      console.error("Erro ao buscar grupos do LDAP: ", error);
      return []
    }
  }

  getUsers(): User[] {
    try {
      const result = execSync(`ldapsearch -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w ${process.env.LDAP_ADMIN_PASSWORD} -b "ou=Users,dc=openconsult,dc=com,dc=br" memberOf uid cn telephoneNumber`, {
        encoding: "utf-8",
        shell: "bash"
      });

      const lines = result.split("\n");

      let user: { uid?: string; cn?: string; telephoneNumber?: string; memberOf: string[] } = { memberOf: [] };
      let userId = 1;
      let users: User[] = []

      console.log("\n----------- USUÁRIOS ----------- \n");
      lines.forEach((line) => {
        if (line.startsWith("uid:")) {
          if (user.uid && user.cn) {
            const groups = user.memberOf.length > 0 ? user.memberOf.join(", ") : "Esse usuário ainda não possui grupos."
              console.log(
                `[${userId}] Usuário: ${user.uid} | Nome completo: ${user.cn} | Telefone: ${user.telephoneNumber} | Grupos: ${groups}`
              );
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

        if (user.uid && user.cn && user.telephoneNumber && user.memberOf.length > 0) {
          const userObj: User = {
            uid_username: user.uid,
            cn_fullName: user.cn,
            phone: user.telephoneNumber,
            groups: user.memberOf || []
          };
      
          users.push(userObj);
        }
      });

      if (user.uid && user.cn) {
        const groups = user.memberOf.length > 0 ? user.memberOf.join(", ") : "Esse usuário ainda não possui grupos."
        console.log(
          `[${userId}] Usuário: ${user.uid} | Nome completo: ${user.cn} | Telefone: ${user.telephoneNumber} | Grupos: ${groups}`
        );
      }

      return users
    } catch (error) {
      console.error("Erro ao buscar usuários do LDAP: ", error);
      return []
    }
  }

  addUser(user: User): void {
    const users = this.getUsers();

    if (users.find(u => u.uid_username === user.uid_username)) {
      console.log(`O usuário ${user.uid_username} já existe.`);
      return;
    }

    const url = `ldapadd -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w ${process.env.LDAP_ADMIN_PASSWORD}`;
    const dn = `dn: uid=${user.uid_username},ou=Users,dc=openconsult,dc=com,dc=br`
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
      execSync(url, {
      input: dn + ldifContent, // Melhorar se sobrar tempo
        encoding: "utf-8", 
        shell: "bash"
      });

      user.groups.length > 0 ? this.addUserToGroup(user.uid_username, user.groups) : ""
        console.log(`O usuário ${user.uid_username} foi adicionado com sucesso!`)
    } catch (error) {
      console.error("Erro ao adicionar usuário ao LDAP: ", error);
    }
  }

  addUserToGroup(userId: string, groups: string[]){
    try {
      const users = this.getUsers();
      const userExists = users.some(u => u.uid_username === userId);

      if (!userExists) {
        console.log(`O usuário ${userId} não existe.`);
        return;
      }

      groups.forEach(cn => {
        const groups = this.getGroups();
        const groupExists = groups.some(g => g.cn_id === cn);

        if (!groupExists) {
          console.log(`O grupo ${cn} não existe.`);
          return;
        }

        const group = groups.find(g => g.cn_id === cn);
        const userDn = `uid=${userId},ou=Users,dc=openconsult,dc=com,dc=br`;

        if (group?.member.includes(userDn)) {
          console.log(`O usuário ${userId} já faz parte do grupo ${cn}.`);
          return;
        }

        if (!group?.member.includes(userDn)) {
          console.log(`O usuário ${userId} já faz parte do grupo ${cn}.`);
          return;
        }

        execSync(`
ldapmodify -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w ${process.env.LDAP_ADMIN_PASSWORD} <<EOF
dn: cn=${cn},ou=Groups,dc=openconsult,dc=com,dc=br
changetype: modify
add: member
member: uid=${userId},ou=Users,dc=openconsult,dc=com,dc=br
EOF`, { encoding: "utf-8", shell: "bash" })

      console.log(`Grupo ${cn} adicionado com sucesso!`)
      })
    } catch (error) {
      console.error("Erro ao adicionar usuário ao grupo.", error)
    }
  }

  removeUserFromGroup(userId: string, groups: string[]){
    try {
      const users = this.getUsers();
      const userExists = users.some(u => u.uid_username === userId);

      if (!userExists) {
        console.log(`O usuário ${userId} não existe.`);
        return;
      }

      groups.forEach(cn => {
        const groups = this.getGroups();
        const groupExists = groups.some(g => g.cn_id === cn);

        if (!groupExists) {
          console.log(`O grupo ${cn} não existe.`);
          return;
        }

        const group = groups.find(g => g.cn_id === cn);
        const userDn = `uid=${userId},ou=Users,dc=openconsult,dc=com,dc=br`;

        if (!group?.member.includes(userDn)) {
          console.log(`O usuário ${userId} não faz parte do grupo ${cn}.`);
          return;
        }
      })

      groups.forEach((cn) => {
        const members = this.getMembers(cn);
        const userDn = `uid=${userId},ou=Users,dc=openconsult,dc=com,dc=br`;
  
        const ldifCommand =
          members.length > 1
            ? `
  ldapmodify -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w ${process.env.LDAP_ADMIN_PASSWORD} <<EOF
  dn: cn=${cn},ou=Groups,dc=openconsult,dc=com,dc=br
  changetype: modify
  delete: member
  member: ${userDn}
  EOF`
            : `
  ldapmodify -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w ${process.env.LDAP_ADMIN_PASSWORD} <<EOF
  dn: cn=${cn},ou=Groups,dc=openconsult,dc=com,dc=br
  changetype: modify
  replace: member
  member:
  EOF`;
  
        execSync(ldifCommand, { encoding: "utf-8", shell: "bash" });
  
        console.log(`Grupo ${cn} removido com sucesso!`);
      });
    } catch (error) {
      console.error("Erro ao remover usuário do grupo:", error);
    }
  }

  getMembers(groupId: string): string[]{
    try {
      const result = execSync(
        `ldapsearch -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w ${process.env.LDAP_ADMIN_PASSWORD} -b "cn=${groupId},ou=Groups,dc=openconsult,dc=com,dc=br" member`,
        { encoding: "utf-8", shell: "bash" }
      );
  
      const lines = result.split("\n");
      const members: string[] = [];
  
      lines.forEach((line) => {
        if (line.startsWith("member:")) {
          const memberDn = line.replace("member: ", "").trim();
          if (memberDn) members.push(memberDn);
        }
      });
  
      return members;
    } catch (error) {
      console.error(`Erro ao buscar membros do grupo ${groupId}:`, error);
      return [];
    }
  }

  addGroup(group: Group): void {
    try {
      const groups = this.getGroups();

      if (groups.find(g => g.cn_id === group.cn_id)) {
        console.log(`O grupo ${group.cn_id} já existe.`);
        return;
      }

      execSync(`ldapadd -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w ${process.env.LDAP_ADMIN_PASSWORD} <<EOF
dn: cn=${group.cn_id},ou=Groups,dc=openconsult,dc=com,dc=br
objectClass: top
objectClass: groupOfNames
cn: ${group.cn_id}
description: ${group.description}
member: 
EOF`, {
        encoding: "utf-8", 
        shell: "bash"
      });

      console.log(`O grupo ${group.cn_id} foi adicionado com sucesso!`)
    } catch (error) {
      console.error("Erro ao adicionar grupo ao LDAP: ", error);
    }
  }

  modifyUserGroups(username: string, groupsToAdd: string[], groupsToRemove: string[]){  
    try {
      groupsToRemove.forEach(groupId => {
        execSync(`
ldapmodify -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w ${process.env.LDAP_ADMIN_PASSWORD} <<EOF
dn: cn=${groupId},ou=Groups,dc=openconsult,dc=com,dc=br
changetype: modify
replace: member
member: 
EOF`, { encoding: "utf-8", shell: "bash" });
        
        console.log(`Usuário ${username} removido do grupo ${groupId}`);
        this.addUserToGroup(username, groupsToAdd)
      });
    } catch (error) {
      console.error("Erro ao modificar usuário.", error)
    }
  }


}