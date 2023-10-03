import { Cmd } from "./Cmd";
import { Home } from "./Home";
export declare class Structs {
    private m_Home;
    static get Home(): Home;
    private static _instance;
    static get instance(): Structs;
    constructor();
    private _routs;
    get routs(): Map<string, Cmd>;
    static getCmd(route: string): Cmd;
}
