const fs = require('fs');
const path = require('path');

const const_route_files = [
    'Cmd.ts',
    'RouteBase.ts',
    'MarkRoutes.ts',
];

// rm other files in src
const src_folder = path.join(__dirname, '..', 'src');

fs.readdirSync(src_folder).forEach(file => {
    const file_path = path.join(src_folder, file);
    if (file_path.endsWith('.ts')) {
        if (const_route_files.indexOf(file) < 0) {
            // console.log('delete ' + file_path);
            fs.unlink(file_path, function (err) {
                if (err) console.log('ERROR: ' + err);
            });
        }
    }
});

// read routes from server
const server_root = path.join(__dirname, '..', '..', 'pinus-ws');
const server_app_folder = path.join(server_root, 'app');
const file_dict = {};
const route_list = [];

function fileDictAddRoute(r) {
    // { clazz: '', client: '', server: '', route: '' };
    let list;
    if (file_dict.hasOwnProperty(r.clazz)) {
        list = file_dict[r.clazz]
    }
    else {
        list = [];
    }
    list.push(r);
    file_dict[r.clazz] = list;
    if (route_list.indexOf(r.route) < 0) {
        route_list.push(r.route);
    }
    else {
        console.error('ERROR: route duplicated: ' + r.route);
    }
}

// @MarkRoute('FooRoute', proto.LargeNumber, proto.LargeNumber)
// async onNotifyLargeNumber(msg: any, session: FrontendSession) 

const regexMarkRoute = /@MarkRoute\(\W*['"]\W*(\w+)\W*['"]\W*,\W*([\w\d\.]+)\W*,\W*([\w\d\.]+)\)/s;
const regexFunc = /[\t ]([\w\d]+)\W*\(/s;

function pathToRoute(path) {
    return path.substr(0, path.length - 3).replaceAll('/', '.').replaceAll('.handler.', '.').replaceAll('servers.', '');
}

// callback(root, relative file name) 
function walkDirSync(root, relative, callback) {
    const full = path.join(root, relative);
    fs.readdirSync(full).forEach(f => {
        if (fs.statSync(path.join(full, f))?.isDirectory())
            walkDirSync(root, path.join(relative, f), callback)
        else
            callback(root, path.join(relative, f));
    });
}

walkDirSync(server_app_folder, '', (root, file) => {
    if (file.endsWith('.ts')) {
        // console.log(file);
        const file_path = path.join(server_app_folder, file);
        var original = fs.readFileSync(file_path, { encoding: 'utf8' });

        var file_route = pathToRoute(file);

        if (original.indexOf('@MarkRoute') >= 0) {
            let markRoute = { clazz: '', client: '', server: '', route: '', func: '' };
            let hasMark = false;
            let lines = original.split('\n');
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                var matchRoute = regexMarkRoute.exec(line);
                if (matchRoute) {
                    hasMark = true;
                    markRoute.clazz = matchRoute[1];
                    markRoute.client = matchRoute[2];
                    markRoute.server = matchRoute[3];
                    continue;
                }
                if (hasMark) {
                    console.log(line);
                    var matchFunc = regexFunc.exec(line);
                    if (matchFunc) {
                        markRoute.func = matchFunc[1];
                        markRoute.route = file_route + '.' + markRoute.func;
                        fileDictAddRoute(markRoute);
                        hasMark = false;
                        markRoute = { clazz: '', client: '', server: '', route: '', func: '' };
                    }
                }
            }
        }
    }
});

const clazz_names = Object.keys(file_dict);

function getInsertIndex(lines, mark) {
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

function uppcaseFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// write routes to src
const route_template = path.join(__dirname, 'Route.ts.template');

clazz_names.forEach(clazz => {
    var route_file = path.join(src_folder, clazz + '.ts')
    fs.copyFileSync(route_template, route_file);

    var original = fs.readFileSync(route_file, { encoding: 'utf8' });

    // replace class name
    original = original.replace(/\*RouteName\*/g, clazz);

    // insert cmds
    let lines = original.split('\n');
    let index = getInsertIndex(lines, '// ------------------- * implement Cmds * -------------------');

    const route_lines = [];
    const routes = file_dict[clazz];
    routes.forEach(element => {
        // let markRoute = { clazz: '', client: '', server: '', route: '', func: '' };
        route_lines.push(`public ${uppcaseFirst(element.func)}: Cmd = Cmd.create('${element.route}', ${element.client}, ${element.server});`);
    });
    lines.splice(index, 1, ...route_lines);

    fs.writeFileSync(route_file, lines.join('\n'), { encoding: 'utf8' });
});

// export routes
{
    const export_path = path.join(server_root, 'config', 'dictionary.json');
    route_list.sort();
    fs.writeFileSync(export_path, JSON.stringify(route_list, null, 4), { encoding: 'utf8' });
}

//  gen structs
{
    const structs_template = path.join(__dirname, 'Structs.ts.template');
    var structs_file = path.join(src_folder, 'Structs.ts')
    fs.copyFileSync(structs_template, structs_file);

    var original = fs.readFileSync(structs_file, { encoding: 'utf8' });
    let lines = original.split('\n');

    // gen import
    let import_index = getInsertIndex(lines, '// ------------------- * import routes * -------------------');
    const import_lines = [];
    clazz_names.forEach(clazz => {
        import_lines.push(`import { ${clazz} } from "./${clazz}";`);
    });
    lines.splice(import_index, 1, ...import_lines);

    // gen property
    let property_index = getInsertIndex(lines, '// ------------------- * property routes * -------------------');
    const property_lines = [];
    clazz_names.forEach(clazz => {
        property_lines.push(`private m_${clazz}: ${clazz} = null;`);
        property_lines.push(`public static get ${clazz}(): ${clazz} { return this.instance.m_${clazz}; }`);
    });
    lines.splice(property_index, 1, ...property_lines);

    // gen instantiate
    let instantiate_index = getInsertIndex(lines, '// ------------------- * instantiate routes * -------------------');
    const instantiate_lines = [];
    clazz_names.forEach(clazz => {
        instantiate_lines.push(`this.m_${clazz} = new ${clazz}();`);
    });
    lines.splice(instantiate_index, 1, ...instantiate_lines);

    fs.writeFileSync(structs_file, lines.join('\n'), { encoding: 'utf8' });
}

// gen index
{
    const index_template = path.join(__dirname, 'index.ts.template');
    var index_file = path.join(src_folder, 'index.ts')
    fs.copyFileSync(index_template, index_file);

    var original = fs.readFileSync(index_file, { encoding: 'utf8' });
    let lines = original.split('\n');

    clazz_names.forEach(clazz => {
        lines.push(`export { ${clazz} } from "./${clazz}";`);
    });

    fs.writeFileSync(index_file, lines.join('\n'), { encoding: 'utf8' });
}
