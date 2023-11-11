import { promises as fs } from 'fs';
import * as path from 'path';
import { walkDir } from './FileUtil';

const project_root = path.join(__dirname, '..');
const server_root = path.join(project_root, '..', 'pinus-ws');

interface IRoute {
    // { clazz: '', client: '', server: '', route: '', func: '' }
    clazz: string;
    client: string;
    server: string;
    route: string;
    func: string;
}

function fileDictAddRoute(r: IRoute, file_dict: { [clazz: string]: IRoute[] }, route_list: string[]) {
    // { clazz: '', client: '', server: '', route: '' };

    let list: IRoute[] = file_dict[r.clazz] || [];
    list.push(r);
    file_dict[r.clazz] = list;

    if (route_list.includes(r.route) == false) {
        route_list.push(r.route);
    }
    else {
        console.error('ERROR: route duplicated: ' + r.route);
    }
}

function pathToRoute(p: string) {
    return p.substring(0, p.length - 3)
        .replaceAll('/', '.')
        .replaceAll('.handler.', '.')
        .replaceAll('servers.', '');
}

function getInsertIndex(lines: string[], mark: string) {
    let insertLine = -1;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.trim() == mark) {
            insertLine = i;
            break;
        }
    }
    return insertLine;
}

function uppcaseFirst(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function generateRoutes() {

    // read routes from server

    const server_app_folder = path.join(server_root, 'app');
    const file_dict: { [clazz: string]: IRoute[] } = {};
    const route_list: string[] = [];

    // @MarkRoute('FooRoute', proto.LargeNumber, proto.LargeNumber)
    // async onNotifyLargeNumber(msg: any, session: FrontendSession) 

    const regexMarkRoute = /@MarkRoute\(\W*['"]\W*(\w+)\W*['"]\W*,\W*([\w\d\.]+)\W*,\W*([\w\d\.]+)\)/s;
    const regexFunc = /[\t ]([\w\d]+)\W*\(/s;

    const files = await walkDir(server_app_folder, ['.ts']);

    for (const file of files) {

        const file_path = path.join(server_app_folder, file);
        let original = await fs.readFile(file_path, { encoding: 'utf8' });

        let file_route = pathToRoute(file);

        if (original.includes('@MarkRoute')) {
            let markRoute = { clazz: '', client: '', server: '', route: '', func: '' };
            let hasMark = false;
            let lines = original.split('\n');
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                let matchRoute = regexMarkRoute.exec(line);
                if (matchRoute) {
                    hasMark = true;
                    markRoute.clazz = matchRoute[1];
                    markRoute.client = matchRoute[2];
                    markRoute.server = matchRoute[3];
                    continue;
                }
                if (hasMark) {
                    console.log(line);
                    let matchFunc = regexFunc.exec(line);
                    if (matchFunc) {
                        markRoute.func = matchFunc[1];
                        markRoute.route = file_route + '.' + markRoute.func;
                        fileDictAddRoute(markRoute, file_dict, route_list);
                        hasMark = false;
                        markRoute = { clazz: '', client: '', server: '', route: '', func: '' };
                    }
                }
            }
        }
    }

    const clazz_names = Object.keys(file_dict);

    // write routes to src
    const route_template = path.join(__dirname, 'Route.ts.template');

    for (const clazz of clazz_names) {
        console.log('deal with route: ' + clazz);

        let route_file = path.resolve(project_root, 'src', clazz + '.ts')
        await fs.rm(route_file, { recursive: true, force: true });
        await fs.copyFile(route_template, route_file);

        let original = await fs.readFile(route_file, { encoding: 'utf8' });

        // replace class name
        original = original.replace(/\*RouteName\*/g, clazz);

        // insert cmds
        let lines = original.split('\n');
        let index = getInsertIndex(lines, '// ------------------- * implement Cmds * -------------------');

        const route_lines: string[] = [];
        const routes = file_dict[clazz];
        for (const element of routes) {
            route_lines.push(`    public ${uppcaseFirst(element.func)} = Cmd.create('${element.route}', ${element.client}, ${element.server});`);
        }
        lines.splice(index, 1, ...route_lines);

        await fs.writeFile(route_file, lines.join('\n'), { encoding: 'utf8' });
    }

    // export routes
    const export_path = path.join(server_root, 'config', 'dictionary.json');
    route_list.sort();
    await fs.writeFile(export_path, JSON.stringify(route_list, null, 4), { encoding: 'utf8' });

    //  gen structs
    const structs_template = path.join(__dirname, 'Structs.ts.template');
    let structs_file = path.join(project_root, 'src', 'Structs.ts')

    await fs.rm(structs_file, { recursive: true, force: true });
    await fs.copyFile(structs_template, structs_file);

    let structs_lines = (await fs.readFile(structs_file, { encoding: 'utf8' })).split('\n');

    // gen import
    let structs_import_index = getInsertIndex(structs_lines, '// ------------------- * import routes * -------------------');
    const structs_import_lines = [];
    for (const clazz of clazz_names) {
        structs_import_lines.push(`import { ${clazz} } from "./${clazz}";`);
    }
    structs_lines.splice(structs_import_index, 1, ...structs_import_lines);

    // gen property
    let structs_property_index = getInsertIndex(structs_lines, '// ------------------- * property routes * -------------------');
    const structs_property_lines = [];
    for (const clazz of clazz_names) {
        structs_property_lines.push(`    private m_${clazz}: ${clazz} = null;`);
        structs_property_lines.push(`    public static get ${clazz}(): ${clazz} { return this.instance.m_${clazz}; }`);
    }
    structs_lines.splice(structs_property_index, 1, ...structs_property_lines);

    // gen instantiate
    let structs_instantiate_index = getInsertIndex(structs_lines, '// ------------------- * instantiate routes * -------------------');
    const structs_instantiate_lines = [];
    for (const clazz of clazz_names) {
        structs_instantiate_lines.push(`        this.m_${clazz} = new ${clazz}();`);
    }
    structs_lines.splice(structs_instantiate_index, 1, ...structs_instantiate_lines);

    await fs.writeFile(structs_file, structs_lines.join('\n'), { encoding: 'utf8' });

    // gen index
    const index_template = path.join(__dirname, 'index.ts.template');
    let index_file = path.join(project_root, 'src', 'index.ts')
    await fs.rm(index_file, { recursive: true, force: true });
    await fs.copyFile(index_template, index_file);

    let index_lines = (await fs.readFile(index_file, { encoding: 'utf8' })).split('\n');
    for (const clazz of clazz_names) {
        index_lines.push(`export { ${clazz} } from "./${clazz}";`);
    }
    await fs.writeFile(index_file, index_lines.join('\n'), { encoding: 'utf8' });
}