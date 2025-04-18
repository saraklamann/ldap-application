"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const xml_reader_1 = require("./utils/xml-reader");
const ldap_storage_1 = require("./storage/ldap-storage");
const readline = __importStar(require("readline"));
const get_avaliable_groups_1 = require("./utils/get-avaliable-groups");
const parse_service_1 = require("./services/parse.service");
const display_groups_1 = require("./utils/display-groups");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const storage = new ldap_storage_1.LDAPStorage();
const parseService = new parse_service_1.ParseService(storage);
function showMenu() {
    console.log("\n------- MENU -------\n");
    console.log("[1] Adicionar Grupo");
    console.log("[2] Adicionar Usuário");
    console.log("[3] Modificar Usuário");
    console.log("[4] Exibir grupos");
    console.log("[5] Exibir usuários");
    console.log("[0] Sair");
}
function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}
async function showGroupMenu() {
    const availableGroups = (0, get_avaliable_groups_1.getAvailableGroupDescriptions)();
    if (availableGroups.length === 0) {
        console.log("Não há grupos disponíveis para adicionar.");
        rl.question("Pressione Enter para voltar ao menu principal.", () => {
            showMenu();
        });
        return;
    }
    console.log("\n--- Grupos disponíveis para adicionar: ---");
    availableGroups.forEach((groupDescription, index) => {
        console.log(`[${index + 1}] ${groupDescription}`);
    });
    const choice = await askQuestion("Escolha o grupo a ser adicionado: ");
    if (parseInt(choice) > availableGroups.length || parseInt(choice) < 1) {
        console.log("Opção inválida!");
        return;
    }
    else {
        const addGroupXML = (0, xml_reader_1.readXMLFile)(`AddGrupo${choice}.xml`);
        parseService.execute(addGroupXML);
    }
}
async function main() {
    let exit = false;
    while (!exit) {
        showMenu();
        const choice = await askQuestion("Escolha a operação: ");
        switch (choice) {
            case "1":
                await showGroupMenu();
                break;
            case "2":
                const addUserXML = (0, xml_reader_1.readXMLFile)("AddUsuario1.xml");
                parseService.execute(addUserXML);
                break;
            case "3":
                const modifyUserXML = (0, xml_reader_1.readXMLFile)("ModifyUsuario.xml");
                parseService.execute(modifyUserXML);
                break;
            case "4":
                (0, display_groups_1.displayGroups)(storage);
                // const groups = storage.getGroups();
                // console.log("\n----------- GRUPOS -----------\n");
                // groups.forEach((group, index) => {
                //   const members = group.member.length > 0 ? group.member.join(", ") : "Esse grupo ainda não possui membros.";
                //   console.log(`[${index + 1}] Grupo: ${group.cn_id} | Descrição: ${group.description} | Membros: ${members}`);
                // });
                break;
            case "5":
                const users = storage.getUsers();
                console.log("\n----------- USUÁRIOS -----------\n");
                users.forEach((user, index) => {
                    const groups = user.groups.length > 0 ? user.groups.join(", ") : "Esse usuário ainda não possui grupos.";
                    console.log(`[${index + 1}] Usuário: ${user.uid_username} | Nome completo: ${user.cn_fullName} | Telefone: ${user.phone} | Grupos: ${groups}`);
                });
                break;
            case "0":
                exit = true;
                console.log("Saindo...");
                break;
            default:
                console.log("Opção inválida!");
                break;
        }
    }
    rl.close();
}
main();
