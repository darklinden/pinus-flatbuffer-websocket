const args = require('args-parser')(process.argv);
const fs = require('fs').promises;
const path = require('path');
const relative_copy = require('./relative-copy');
const exec = require('./exec');

async function deploy_extension(extensions_path, extensions_deploy_path, extension) {
    const from = path.join(extensions_path, extension);
    const to = path.join(extensions_deploy_path, extension);

    await relative_copy(path.join(from, 'dist'), path.join(to, 'dist'), null);
    await relative_copy(path.join(from, 'package.json'), path.join(to, 'package.json'), null);
}

async function main() {

    const package_name = process.env.npm_package_name;
    console.log('deploy project ' + package_name);

    // parse args of extensions
    const project_path = path.join(__dirname, '..');
    const deploy_path = path.join(project_path, 'deploy', package_name);
    await fs.mkdir(deploy_path, { recursive: true });

    // extensions
    const extensions_path = path.join(project_path, 'extensions');
    const extensions_deploy_path = path.join(deploy_path, 'extensions');
    await fs.mkdir(extensions_deploy_path, { recursive: true });

    await deploy_extension(extensions_path, extensions_deploy_path, 'flatbuffers');
    await deploy_extension(extensions_path, extensions_deploy_path, 'route');

    // pinus
    console.log('deploy pinus');
    await relative_copy(path.join(project_path, 'dist'), path.join(deploy_path, 'dist'), null);
    await relative_copy(path.join(project_path, 'package.json'), path.join(deploy_path, 'package.json'), null);
    await relative_copy(path.join(project_path, 'centos-service'), path.join(deploy_path, 'centos-service'), null);

    // constants
    const constants_path = path.join(deploy_path, 'dist', 'config', 'constants.json');
    const constants = JSON.parse(await fs.readFile(constants_path, 'utf8'));
    constants['redis_host'] = '127.0.0.1';

    // deploy.sh
    await fs.writeFile(path.join(deploy_path, 'deploy.sh'),
        `#!/bin/bash
cwd=$(pwd)
cd $cwd/extensions/flatbuffers && npm install --omit=dev
cd $cwd/extensions/route && npm install --omit=dev
cd $cwd && npm install --omit=dev

systemctl stop ${package_name}
cp -f $cwd/centos-service/${package_name}.service /etc/systemd/system/${package_name}.service
systemctl daemon-reload
systemctl enable ${package_name}
systemctl start ${package_name}
systemctl status ${package_name}
`);

    // zip
    // const zip_result = await exec('cd deploy && zip -r ' + package_name + '.zip ' + package_name);
    // console.log('zip result:/t' + zip_result);

    console.log('deploy project done');
}

main();