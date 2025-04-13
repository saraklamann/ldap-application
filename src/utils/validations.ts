export function isValidName(name: string | null): boolean {
    return (name && name.trim().length > 0) ? true : false;
}