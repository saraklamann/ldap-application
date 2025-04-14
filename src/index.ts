import { readXMLFile } from "./utils/xml-reader";
import { LDAPStorage } from "./storage/ldap-storage";
import { ParseService } from "./services/parse.service";
import * as readline from "readline";
import { getAvailableGroupDescriptions } from "./utils/get-avaliable-groups";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const storage = new LDAPStorage();
const parseService = new ParseService(storage);

function showMenu() {
  console.log("\n------- MENU --------")
  console.log("[1] Adicionar Grupo");
  console.log("[2] Adicionar Usuário");
  console.log("[3] Modificar Usuário");
  console.log("[4] Exibir grupos");
  console.log("[5] Exibir usuários");
  console.log("[0] Sair");
}

function askQuestion(question: string) {
  return new Promise<string>((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function showGroupMenu() {
  const availableGroups = getAvailableGroupDescriptions();

    if (availableGroups.length === 0) {
        console.log("Não há grupos disponíveis para adicionar.");
        rl.question("Pressione Enter para voltar ao menu principal.", () => {
            showMenu();
        });
        return;
    }

    console.log("\nGrupos disponíveis para adicionar:");
    availableGroups.forEach((groupDescription, index) => {
        console.log(`[${index + 1}] ${groupDescription}`);
    });

    const choice = await askQuestion("Escolha o grupo a ser adicionado: ");

    if (parseInt(choice) > availableGroups.length || parseInt(choice) < 1){
      console.log("Opção inválida!")
      return
    } else {
      const addGroupXML = readXMLFile(`AddGrupo${choice}.xml`)
      parseService.execute(addGroupXML);
    }

}

// async function main() {
//   let exit = false;

//   while (!exit) {
//     showMenu();
//     const choice = await askQuestion("Escolha a operação: ");

//     switch (choice) {
//       case "1":
//         await showGroupMenu();
//         break;
//       case "2":
//         const addUserXML = readXMLFile("AddUsuario1.xml");
//         parseService.execute(addUserXML);
//         break;
//       case "3":
//         const modifyUserXML = readXMLFile("ModifyUsuario.xml");
//         parseService.execute(modifyUserXML);
//         break;
//       case "4":
//         const allGroups = storage.getGroups();
//         if (allGroups.length === 0) {
//           console.log("Nenhum grupo foi adicionado ainda.");
//         } else {
//           console.log("Grupos já inseridos:");
//           allGroups.forEach((group) => {
//             console.log(group);
//           });
//         }
//         break;
//       case "5":
//         const users = storage.getUsers();
//         console.log("Usuários registrados: ");
//         users.forEach((user) => {
//           console.log(`Usuário: ${user.fullName} - Groups: ${user.groups.join(", ")}`);
//         });
//         break;
//       case "0":
//         exit = true;
//         console.log("Saindo...");
//         break;
//       default:
//         console.log("Opção inválida!");
//         break;
//     }
//   }

//   rl.close();
// }

function main(){
  // const xml = readXMLFile("AddUsuario1.xml");
  // parseService.execute(xml);

  storage.getUsersFromLDAP();
}

main();
