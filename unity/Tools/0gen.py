#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
import shutil

from cprelative import copy_file


def delete_files_in_folder(folder: str, extension: str):
    for root, _, file in os.walk(folder):
        for f in file:
            if not f.endswith(extension):
                continue
            fp = os.path.join(root, f)
            os.remove(fp)


def deal_with_proto(local_path: str):

    # copy proto csharp
    project_path = os.path.dirname(local_path)
    origin_proto = os.path.dirname(
        project_path) + '/proto/generated/csharp/Proto'
    script_proto = project_path + '/Assets/Plugins/Proto'

    delete_files_in_folder(script_proto, '.cs')

    # copy cs
    copy_file(origin_proto, script_proto,
              size_check_only=False, extensions=['cs'], quiet=True)


def gen_route(folder: str):
    os.remove(folder + '/index.ts')
    os.remove(folder + '/Cmd.ts')
    os.remove(folder + '/Structs.ts')
    os.remove(folder + '/RouteBase.ts')
    os.remove(folder + '/MarkRoutes.ts')
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


def deal_with_route(local_path: str):

    local_route = local_path + '/route'

    # clean
    shutil.rmtree(local_route, ignore_errors=True)

    # clone route
    project_path = os.path.dirname(local_path)
    origin_route = os.path.dirname(project_path) + '/route/src'

    # copy route
    copy_file(origin_route, local_route,
              size_check_only=False, extensions=['ts'], quiet=True)

    # gen route
    route_files = gen_route(local_route)

    # copy cs
    script_route = os.path.dirname(local_path) + '/Assets/Plugins/Route'
    copy_file(local_route, script_route,
              size_check_only=False, extensions=['cs'], quiet=True)

    # gen structs
    gen_structs(route_files, os.path.join(script_route, 'Structs.cs'))

    # clean
    shutil.rmtree(local_route, ignore_errors=True)


def deal_with_configs(local_path: str):

    local_configs = os.path.dirname(
        local_path) + '/Assets/Resources/Configs'
    if os.path.exists(local_configs):
        shutil.rmtree(local_configs)
    os.makedirs(local_configs, exist_ok=True)

    # clone route
    project_path = os.path.dirname(local_path)
    origin_configs = os.path.dirname(
        project_path) + '/proto/generated/bytes'

    # copy route
    copy_file(origin_configs, local_configs,
              size_check_only=False, extensions=['bytes'], quiet=True)


def main():
    local_path = os.getcwd()

    deal_with_proto(local_path)
    deal_with_route(local_path)
    deal_with_configs(local_path)

    print('Done')


if __name__ == "__main__":
    main()
