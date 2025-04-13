"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidName = isValidName;
function isValidName(name) {
    return (name && name.trim().length > 0) ? true : false;
}
