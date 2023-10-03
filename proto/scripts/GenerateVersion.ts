import { execSync } from "child_process";
import fs = require("fs");
import path = require("path");
import { chdir } from "process";
import * as crypto from 'crypto';

import { paths } from "./Paths"

export function generate_version(bytes_path_list: [string, string, string][], version_path: string): void {

    const md5 = crypto.createHash('md5')
    // .update(contents).digest("hex");

    const bytes = [];

    for (const item of bytes_path_list) {
        let bytes_path = item[2];
        bytes_path = bytes_path.replace(/\.bin/g, '.bytes');
        bytes.push(bytes_path);
    }

    bytes.sort();

    for (const bytes_path of bytes) {
        const contents = fs.readFileSync(bytes_path, 'binary');
        md5.update(contents);
    }

    const version = md5.digest("hex");
    console.log('version: ', version);
    fs.writeFileSync(version_path, version, 'utf8');
}