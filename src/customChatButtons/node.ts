import { resolve } from "node:path";
import fs from "node:fs";

export function getFileDataSync(file: string) {
    let path = resolve(file);
    if (!fs.existsSync(path)) {
        return undefined;
    }
    let data = fs.readFileSync(path, 'utf8');
    return data;
}