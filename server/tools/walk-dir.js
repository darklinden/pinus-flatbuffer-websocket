const fs = require('fs').promises;
const path = require('path');

/**
 * 
 * @param {string} root 
 * @param {string|string[]} ext 
 * @param {string} relative 
 * @returns string[]
 */
async function walk_dir(root, ext, relative = '') {
    const full = path.join(root, relative);
    const files = [];
    const dir_content = await fs.readdir(full);
    for (let i = 0; i < dir_content.length; i++) {
        const f = dir_content[i];
        const stat = await fs.stat(path.join(full, f));
        if (stat?.isDirectory()) {
            const sub = path.join(relative, f);
            const sub_files = await walk_dir(root, ext, sub);
            files.push(...sub_files);
        }
        else {
            let ext_check = true;
            if (ext) {
                if (typeof ext == 'string') ext = [ext];
                ext_check = ext.indexOf(path.extname(f)) != -1;
            }
            if (ext_check)
                files.push(path.join(relative, f));
        }
    }
    return files;
}

module.exports = walk_dir;