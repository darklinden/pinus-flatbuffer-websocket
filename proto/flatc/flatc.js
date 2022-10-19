#!/usr/bin/env node

const path = require('path');
const execSync = require('child_process').execSync;

console.log('Running flatc.js');

const root = path.resolve(__dirname, "..");
const flatc_folder = path.join(root, 'flatc');
let flatc = 'flatc';
switch (process.platform) {
    // windows
    case 'win32':
    case 'cygwin':
        flatc = path.join(flatc_folder, 'flatc.exe');
        break;
    // mac
    case 'darwin':
        flatc = path.join(flatc_folder, 'flatc-darwin-intel');
        break;
    // linux
    default:
        flatc = path.join(flatc_folder, 'flatc-linux');
        break;
}

execSync(flatc + ' ' + process.argv.slice(2).join(' '), { stdio: 'inherit' });
