import * as path from 'path';
import { relativeCopy } from './FileUtil';

function parse_args(args: string[]): { [key: string]: string[] } {

    const result: { [key: string]: string[] } = {};

    let idx = 1;
    let key: string = '';
    let value: string[] = [];
    while (idx < args.length) {
        let a = args[idx];
        idx++;
        if (a.startsWith('--') && a.length > 2) {
            // is a key
            let newKey = a.substring(2);
            if (key.length > 0) {
                result[key] = value;
                value = result[newKey] || [];
            }
            key = newKey;
        }
        else {
            // parse a value
            if (key.length > 0)
                value.push(a);
        }
    }

    if (key.length > 0 && value.length > 0 && !result[key]) {
        result[key] = value;
    }

    return result;
}

async function main() {

    console.log('copy files from one directory to another directory');

    const args = parse_args(process.argv);

    console.log('args: ' + JSON.stringify(args));

    // parse args of extensions
    const cwd = process.cwd();

    let from = path.resolve(cwd, args['from'][0]);
    let to = path.resolve(cwd, args['to'][0]);

    const extension: string[] = [];
    if (args['extension']) {
        for (let i = 0; i < args['extension'].length; i++) {
            let ext = args['extension'][i];
            const extensions = ext.split(',') || [];
            for (let e of extensions) {
                e = e.trim();
                if (e.length == 0) continue;
                if (!e.startsWith('.')) {
                    e = '.' + e;
                }
                extension.push(e);
            }
        }

        await relativeCopy(from, to, extension);
    }
}

main();