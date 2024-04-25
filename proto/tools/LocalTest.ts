import * as path from "path";
import { startLocalConfigServer } from "./BuildTool";
import { buildFlat } from "../scripts/BuildFlat";

const project_path = path.resolve(__dirname, "..");

async function main() {

    console.log("run under root:", project_path);

    await buildFlat();

    await startLocalConfigServer();
}


main();
