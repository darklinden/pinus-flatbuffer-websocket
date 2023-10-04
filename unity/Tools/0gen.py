#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import hashlib
import os
import re
import shutil


def delete_files_in_folder(folder: str, extensions: list = None):
    print('delete files in folder: ' + folder +
          ' extensions: ' + str(extensions))
    for root, dirs, files in os.walk(folder):
        for fn in files:
            fpath = os.path.join(root, fn)
            if os.path.isfile(fpath):
                fextension = fn[fn.rfind('.') + 1:]
                if (extensions is None) or fextension in extensions:
                    # print('remove file: ' + fpath)
                    os.remove(fpath)


def deal_with_proto(origin_proto: str, project_path: str):

    print('deal with proto:')

    # copy proto csharp
    origin_proto_csharp = os.path.join(
        origin_proto, 'generated', 'csharp', 'Proto')
    script_proto = os.path.join(project_path, 'Assets', 'Plugins', 'Proto')
    # print('copy proto csharp from ' + origin_proto_csharp + ' to ' + script_proto)

    # delete_files_in_folder(script_proto, ['cs'])

    # copy cs
    copy_files(origin_proto_csharp, script_proto, ['cs'], [], True)

    print('')


def gen_route(folder: str, ignore_files: list[str]):
    for f in ignore_files:
        if os.path.exists(folder + '/' + f):
            os.remove(folder + '/' + f)
    shutil.rmtree(folder + '/proto', ignore_errors=True)

    route_files = []
    for root, _, file in os.walk(folder):
        for f in file:
            if not f.endswith('.ts'):
                continue
            route_files.append(f[:f.rfind('.')])
            fp = os.path.join(root, f)
            with open(fp, 'r', encoding='utf-8') as f:
                content = f.read()
                content = content.replace(
                    'export default class', 'public class')
                content = content.replace('export class', 'public class')
                content = content.replace('extends', ':')
                content = content.replace("'", '"')
                content = content.replace("{}", 'null')
                content = re.sub(r'import .*', '', content)
                content = re.sub(r'public (\w+): Cmd = Cmd.create',
                                 r'public Cmd \1 = new Cmd', content)
                content = re.sub(r'proto.(\w+)',
                                 r'typeof(Proto.\1)', content)

            content = "\n".join([ll.rstrip()
                                 for ll in content.splitlines() if ll.strip()])

            fp = fp[:fp.rfind('.')] + '.cs'
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(content)

    return route_files


def get_insert_index(lines: list[str], mark: str) -> int:
    insertLine = -1
    for i in range(len(lines)):
        line = lines[i]
        if line.strip() == mark:
            insertLine = i
            break

    return insertLine


def gen_structs(route_files: list, path: str):
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    property_begin = get_insert_index(
        lines, '// --- property routes begin ---')
    property_end = get_insert_index(
        lines, '// --- property routes end ---')

    property_lines = []
    for route in route_files:
        property_lines.append('    protected ' + route +
                              ' m_' + route + ' = null;\n')
        property_lines.append(
            '    public static ' + route + ' ' + route + ' { get => Instance.m_' + route + '; }\n')

    lines = lines[:property_begin + 1] + \
        property_lines + lines[property_end:]

    instantiate_begin = get_insert_index(
        lines, '// --- instantiate routes begin ---')
    instantiate_end = get_insert_index(
        lines, '// --- instantiate routes end ---')

    instantiate_lines = []
    for route in route_files:
        instantiate_lines.append(
            '        m_' + route + ' = new ' + route + '();\n')

    lines = lines[:instantiate_begin + 1] + \
        instantiate_lines + lines[instantiate_end:]

    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(lines)


def deal_with_route(origin_route: str, project_path: str):

    print('deal with route:')

    local_route = project_path + '/Tools/route'

    # clean
    shutil.rmtree(local_route, ignore_errors=True)

    # clone route
    origin_route_src = origin_route + '/src'

    # copy route
    copy_files(origin_route_src, local_route, ['ts'], [], False, True)

    ignore_files = ['index.ts', 'Cmd.ts', 'Structs.ts',
                    'RouteBase.ts', 'MarkRoutes.ts', 'Cmd.cs', 'Structs.cs', 'RouteBase.cs']
    # gen route
    route_files = gen_route(local_route, ignore_files)

    # copy cs
    script_route = project_path + '/Assets/Plugins/Route'
    copy_files(local_route, script_route, ['cs'], ignore_files)

    # gen structs
    gen_structs(route_files, os.path.join(script_route, 'Structs.cs'))

    # clean
    shutil.rmtree(local_route, ignore_errors=True)

    print('')


def file_md5(path: str) -> str:
    with open(path, "rb") as f:
        file_hash = hashlib.md5()
        while chunk := f.read(8192):
            file_hash.update(chunk)

    # print(file_hash.digest())
    return file_hash.hexdigest()  # to get a printable str instead of bytes


def mkdir_p(path: str, no_log: bool = False):
    if path is None or len(path) == 0:
        return

    if not os.path.isdir(path):
        if no_log == False:
            print("make dir: " + path)
        os.makedirs(path, exist_ok=True)


def file_equal(a: str, b: str) -> bool:

    if os.path.isfile(a) != os.path.isfile(b):
        return False

    if os.stat(a).st_size != os.stat(b).st_size:
        return False

    return file_md5(a) == file_md5(b)


def copy_files(folder_src: str, folder_des: str, exts: list[str], ignore_files: list[str] = [], delete_des: bool = False, no_log: bool = False):
    if no_log == False:
        if exts is None:
            print('copy all files from \n\t' +
                  folder_src + '\nto \n\t' + folder_des)
        else:
            print('copy ' + str(exts) + ' files from \n\t' +
                  folder_src + '\nto \n\t' + folder_des)
    relative_des_files = []
    for root, dirs, files in os.walk(folder_des):
        for fn in files:
            fpath = os.path.join(root, fn)
            if fpath.endswith('.DS_Store'):
                continue

            # Do not copy server only files
            if fpath.count('/ServerOnly/') > 0:
                continue

            if os.path.isfile(fpath):
                fextension = fn[fn.rfind('.') + 1:]
                if (exts is None) or fextension in exts:
                    relative_path = fpath[len(folder_des) + 1:]
                    if relative_path in ignore_files:
                        continue
                    relative_des_files.append(relative_path)

    relative_files = []
    for root, dirs, files in os.walk(folder_src):
        for fn in files:
            fpath = os.path.join(root, fn)
            if fpath.endswith('.DS_Store'):
                continue

            # Do not copy server only files
            if fpath.count('/ServerOnly/') > 0:
                continue

            if os.path.isfile(fpath):
                fextension = fn[fn.rfind('.') + 1:]
                if (exts is None) or fextension in exts:
                    relative_path = fpath[len(folder_src) + 1:]
                    if relative_path in ignore_files:
                        continue
                    relative_files.append(relative_path)

    for relative_path in relative_files:
        src_path = os.path.join(folder_src, relative_path)
        des_path = os.path.join(folder_des, relative_path)
        if file_equal(src_path, des_path):
            if relative_path in relative_des_files:
                relative_des_files.remove(relative_path)
            # print('check passed: ' + src_path + ' -> ' + des_path)
            continue

        if relative_path in relative_des_files:
            relative_des_files.remove(relative_path)

        mkdir_p(os.path.dirname(des_path), no_log=no_log)
        if os.path.isfile(des_path):
            os.remove(des_path)
        if no_log == False:
            print('copy: ' + relative_path)
        shutil.copy(src_path, des_path)

    if len(relative_des_files) > 0:
        if no_log == False:
            print('files in des folder not in src folder:')
        for p in relative_des_files:
            if p in ignore_files:
                continue
            p = os.path.join(folder_des, p)
            if delete_des:
                if no_log == False:
                    print('\t' + p + ' deleted')
                os.remove(p)
            else:
                if no_log == False:
                    print('\t' + p)


def deal_with_configs(origin_proto: str, project_path: str):

    print('deal with configs:')

    local_configs = project_path + '/Assets/Configs'
    if not os.path.exists(local_configs):
        os.makedirs(local_configs, exist_ok=True)
    # delete_files_in_folder(local_configs, ['bytes'])

    # clone route
    origin_configs = origin_proto + '/generated/bytes'

    # copy route
    copy_files(origin_configs, local_configs, ['bytes'], [], True)

    print('')


def main():
    local_path = os.getcwd()

    project_path = os.path.dirname(local_path)
    parent_path = os.path.dirname(project_path)

    origin_proto = os.path.join(parent_path, 'proto')
    origin_route = os.path.join(parent_path,  'route')

    deal_with_proto(origin_proto, project_path)
    deal_with_route(origin_route, project_path)
    deal_with_configs(origin_proto, project_path)

    print('Done')


if __name__ == "__main__":
    main()
