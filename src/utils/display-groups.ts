import { Buffer } from "buffer"; // no topo do arquivo
import { LDAPStorage } from "../storage/ldap-storage";

export function displayGroups(storage: LDAPStorage) {
  const groups = storage.getGroups();
  console.log("\n----------- GRUPOS -----------\n");

  groups.forEach((group, index) => {
    // Decodifica a descrição caso esteja em base64 (detectado por "description:: ")
    let description = group.description || "Sem descrição";
    if (description.startsWith("description::")) {
      const encoded = description.replace("description::", "").trim();
      description = Buffer.from(encoded, "base64").toString("utf-8");
    }

    console.log(`[${index + 1}] Grupo: ${group.cn_id} | Descrição: ${description}`);
  });
}
