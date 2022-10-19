import { Cmd } from "./Cmd";
import { FooBar } from "./FooBar";
export declare class Structs {
    private m_FooBar;
    static get FooBar(): FooBar;
    private static _instance;
    static get instance(): Structs;
    constructor();
    private _routs;
    get routs(): Map<string, Cmd>;
    static getCmd(route: string): Cmd;
}
