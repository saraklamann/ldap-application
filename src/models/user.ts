import { Group } from "./group";

export interface User {
    uid_username: string;
    cn_fullName: string;
    phone: string;
    groups: string[];
}