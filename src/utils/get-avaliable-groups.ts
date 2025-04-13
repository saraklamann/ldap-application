import fs from 'fs';
import path from 'path';
import { DOMParser } from 'xmldom';
import xpath from 'xpath';

export function getAvailableGroupDescriptions(): string[] {
    const xmlDir = path.join(__dirname, "..", "..", "src", 'xml');
    const files = fs.readdirSync(xmlDir);

    const groupDescriptions: string[] = [];

    for (const file of files) {
        if (file.startsWith('AddGrupo') && file.endsWith('.xml')) {
            const content = fs.readFileSync(path.join(xmlDir, file), 'utf-8');
            const doc = new DOMParser().parseFromString(content, 'text/xml');
            const className = doc.documentElement.getAttribute('class-name');

            if (className === 'Grupo') {
                const descriptionNode = (xpath.select("//add-attr[@attr-name='Descricao']/value/text()", doc) as Node[])[0];
                const description = descriptionNode?.nodeValue?.trim();
                if (description) {
                    groupDescriptions.push(description);
                }
            }
        }
    }

    return groupDescriptions;
}
