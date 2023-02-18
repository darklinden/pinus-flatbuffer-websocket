const fs = require('fs').promises;
const path = require('path');
const file_exist = require('./file-exist');
const file_md5 = require('./file-md5');
const walk_dir = require('./walk-dir');

/**
 * 
 * @param {string} from from folder path
 * @param {string} to to folder path
 * @param {string[]} extensions [".js", ".css"] or any other extensions
 */
async function relative_copy(from, to, extensions) {

    const stat_from = await fs.stat(from);
    if (!stat_from?.isDirectory()) {
        // copy file

        if (!(await file_exist(to)) || file_md5(from) != file_md5(to)) {
            console.log('copy file: ' + from + ' -> ' + to);
            await fs.mkdir(path.dirname(to), { recursive: true });
            await fs.copyFile(from, to);
        }
        else {
            console.log('skip file: ' + relative);
        }
        return;
    }

    // copy folder
    console.log('copy files from: ' + from);
    console.log('\tto: ' + to);
    console.log('\textensions: ' + JSON.stringify(extensions));
    console.log('');

    await fs.mkdir(to, { recursive: true });

    let file_total = 0;
    let file_copied = 0;

    let dir_content = await walk_dir(from);

    for (let i = 0; i < dir_content.length; i++) {
        const relative = dir_content[i];
        const ext = path.extname(relative);

        if (!extensions || extensions.length <= 0 || extensions.indexOf(ext) != -1) {
            const src = path.join(from, relative);
            const des = path.join(to, relative);

            if (!(await file_exist(des)) || file_md5(src) != file_md5(des)) {
                console.log('copy file: ' + relative);
                // console.log('\tsrc:\t' + src);
                // console.log('\tdes:\t' + des);
                await fs.mkdir(path.dirname(des), { recursive: true });
                await fs.copyFile(src, des);
                file_copied++;
            }
            else {
                // console.log('build. skip copy equal config file: ' + relative);
            }
            file_total++;
        }
    }

    console.log('total:  \t' + file_total + '\tcopied: \t' + file_copied + '\tskipped:\t' + (file_total - file_copied));
    console.log('copy done.');
    console.log('');
}

module.exports = relative_copy;