import { promises as fs } from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { walkDir } from './FileUtil';
import { copyProtoAndWrapInternal } from './DealWithProto';
import { generateRoutes } from './DealWithRoutes';

const project_root = path.join(__dirname, '..');

async function clearSrc() {

    const const_route_files = [
        'Cmd.ts',
        'RouteBase.ts',
        'MarkRoutes.ts',
    ];

    // rm other files in src
    const src_folder = path.join(project_root, 'src');

    const files = await walkDir(src_folder, ['.ts']);

    for (const file of files) {
        const file_path = path.join(src_folder, file);
        if (const_route_files.indexOf(file) < 0) {
            // console.log('delete ' + file_path);
            await fs.rm(file_path, { recursive: true, force: true });
        }
    }
}

async function clearDes() {
    await fs.rm(path.join(project_root, 'dist'), { recursive: true, force: true });
    await fs.rm(path.join(project_root, 'types'), { recursive: true, force: true });
}


async function main() {

    // "build": "yarn run gen-proto-index && yarn run gen-routes && rm -rf ./dist && rm -rf ./types && tsc",

    await clearSrc();
    await clearDes();

    await copyProtoAndWrapInternal();

    await generateRoutes();

    // build
    console.log('tsc building ...');
    execSync('tsc --project tsconfig-build.json --skipLibCheck', { stdio: 'inherit', cwd: project_root });
    console.log('build done');
}

main();