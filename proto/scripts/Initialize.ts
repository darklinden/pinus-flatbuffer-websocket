import { promises as fs } from "fs";
import { paths } from "./Paths"
import { fileExist } from "../tools/FileUtil";
import * as path from "path";

export async function Initialize() {

    const root = path.resolve(__dirname, "..");
    const flatc_folder = path.join(root, 'flatc');
    switch (process.platform) {
        // windows
        case 'win32':
        case 'cygwin':
            paths.flatc = path.join(flatc_folder, 'flatc.exe');
            break;
        // mac
        case 'darwin':
            paths.flatc = path.join(flatc_folder, 'flatc-darwin-intel');
            break;
        // linux
        default:
            paths.flatc = path.join(flatc_folder, 'flatc-linux');
            break;
    }

    // csv 源文件路径
    paths.csv = path.join(root, 'csv');

    // 生成的 fbs 文件路径
    paths.other_fbs = path.join(root, 'fbs');

    // 生成文件路径 重建以清理
    const generated_folder = path.join(root, 'generated')

    if (await fileExist(generated_folder)) {
        console.log('清理生成文件夹');
        await fs.rm(generated_folder, { recursive: true, force: true });
    }

    await fs.mkdir(generated_folder, { recursive: true });

    // 生成的 flatbuffer 文件路径
    paths.fbs = path.join(generated_folder, 'fbs');
    await fs.mkdir(paths.fbs, { recursive: true });

    // 生成的 ts 文件路径
    paths.ts = path.join(generated_folder, 'ts');
    await fs.mkdir(paths.ts, { recursive: true });

    // 生成的 rust 文件路径
    paths.rust = path.join(generated_folder, 'rust');
    await fs.mkdir(paths.rust, { recursive: true });

    // 生成的 csharp 文件路径
    paths.csharp = path.join(generated_folder, 'csharp');
    await fs.mkdir(paths.csharp, { recursive: true });

    // 生成的 json 文件路径
    paths.json = path.join(generated_folder, 'json');
    await fs.mkdir(paths.json, { recursive: true });

    // 生成的 bytes 文件路径
    paths.bytes = path.join(generated_folder, 'bytes');
    await fs.mkdir(paths.bytes, { recursive: true });

    // 生成的测试文件路径
    paths.tests = path.join(generated_folder, 'tests');
    await fs.mkdir(paths.tests, { recursive: true });
}