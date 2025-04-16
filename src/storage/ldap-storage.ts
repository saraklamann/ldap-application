import { User } from "../models/user";
import { Group } from "../models/group";
import { execSync } from "child_process";

export class LDAPStorage {
  getGroups(): void {
    try {
      const result = execSync(`ldapsearch -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w admin -b "ou=Groups,dc=openconsult,dc=com,dc=br" "(objectClass=groupOfNames)"`, {
        encoding: "utf-8",
        shell: "bash"
      });

      const groupNames = result.split("\n")
        .filter(line => line.startsWith("cn:")) 
        .map(line => line.replace("cn: ", "").trim()); 

      console.log("Grupos encontrados no LDAP: \n");
      groupNames.forEach(name => console.log(`- ${name}`));
    } catch (error) {
      console.error("Erro ao buscar grupos do LDAP: ", error);
    }
  }

  getUsers(): void {
    try {
      const result = execSync(`ldapsearch -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w admin -b "ou=Users,dc=openconsult,dc=com,dc=br" memberOf uid cn telephoneNumber`, {
        encoding: "utf-8",
        shell: "bash"
      });

      const lines = result.split("\n");

      let user: { uid?: string; cn?: string; telephoneNumber?: string ;memberOf: string[] } = { memberOf: [] };
      let userId = 1;

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
      });

      if (user.uid && user.cn) {
        const groups = user.memberOf.length > 0 ? user.memberOf.join(", ") : "Esse usuário ainda não possui grupos."
        console.log(
          `[${userId}] Usuário: ${user.uid} | Nome completo: ${user.cn} | Telefone: ${user.telephoneNumber} | Grupos: ${groups}`
        );
      }
    } catch (error) {
      console.error("Erro ao buscar usuários do LDAP: ", error);
    }
  }
  
  addUser(user: User): void {
    const url = `ldapadd -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w admin`;
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
      groups.forEach(cn => {
        execSync(`
ldapmodify -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w admin <<EOF
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
      groups.forEach((cn) => {
        const members = this.getMembers(cn);
        const userDn = `uid=${userId},ou=Users,dc=openconsult,dc=com,dc=br`;
  
        const ldifCommand =
          members.length > 1
            ? `
  ldapmodify -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w admin <<EOF
  dn: cn=${cn},ou=Groups,dc=openconsult,dc=com,dc=br
  changetype: modify
  delete: member
  member: ${userDn}
  EOF`
            : `
  ldapmodify -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w admin <<EOF
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
        `ldapsearch -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w admin -b "cn=${groupId},ou=Groups,dc=openconsult,dc=com,dc=br" member`,
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
    const url = `ldapadd -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w admin`;
    const dn = `dn: cn=${group.cn_id},ou=Groups,dc=openconsult,dc=com,dc=br`
    const ldifContent = `
objectClass: top
objectClass: groupOfNames
cn: qa
member: 
EOF`; // Melhorar se sobrar tempo

    try {
      execSync(`ldapadd -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w admin <<EOF
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
ldapmodify -x -D "cn=admin,dc=openconsult,dc=com,dc=br" -w admin <<EOF
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