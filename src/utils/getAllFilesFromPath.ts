import fs from 'fs';
import { join } from 'path';

export default (directory: string, foldersOnly = false) => {
    return fs
        .readdirSync(directory, { withFileTypes: true })
        .filter((file) => (foldersOnly ? file.isDirectory() : file.isFile()))
        .map((file) => join(directory, file.name));
};
