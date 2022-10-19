import path = require("path");
import fs = require("fs");

export function walkDirSync(root: string, ext: string, relative: string = ''): string[] {
    const full = path.join(root, relative);
    const files: string[] = [];
    fs.readdirSync(full).forEach(f => {
        if (fs.statSync(path.join(full, f))?.isDirectory())
            files.push(...walkDirSync(root, ext, path.join(relative, f)));
        else
            if (path.extname(f) == ext)
                files.push(path.join(relative, f));
    });
    return files;
}