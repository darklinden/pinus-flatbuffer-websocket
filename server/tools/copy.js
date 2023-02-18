const args = require('args-parser')(process.argv);
const path = require('path');
const relative_copy = require('./relative-copy');


async function main() {

    // parse args of extensions
    const project_path = path.join(__dirname, '..');

    let from = path.join(project_path, args.from);
    let to = path.join(project_path, args.to);

    const extension = args.extension || '';
    let extensions = extension.split(',') || [];
    for (let i = extensions.length - 1; i >= 0; i--) {
        extensions[i] = extensions[i].trim();
        if (extensions[i].length == 0) {
            extensions.splice(i, 1);
        }
        else {
            if (!extensions[i].startsWith('.')) {
                extensions[i] = '.' + extensions[i];
            }
        }
    }

    await relative_copy(from, to, extensions);
}

main();