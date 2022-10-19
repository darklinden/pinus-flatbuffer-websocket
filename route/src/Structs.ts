import { Cmd } from "./Cmd";
import { RouteBase } from "./RouteBase";

import { FooBar } from "./FooBar";

export class Structs {

    // --- group routes begin ---
private m_FooBar: FooBar = null;
public static get FooBar(): FooBar { return this.instance.m_FooBar; }
    // --- group routes end ---

    // --- instance begin ---
    private static _instance: Structs = null;
    public static get instance(): Structs {
        if (!this._instance) this._instance = new Structs();
        return this._instance;
    }
    // --- instance end ---

    constructor() {
this.m_FooBar = new FooBar();
    }

    private _routs: Map<string, Cmd> = null;
    public get routs(): Map<string, Cmd> {
        if (!this._routs) {
            this._routs = new Map();
            for (const key in this) {
                if (Object.prototype.hasOwnProperty.call(this, key)) {
                    const element: any = this[key];
                    if (element instanceof RouteBase) {
                        for (let [key, value] of element.getMap()) {
                            this._routs.set(key, value);
                        }
                    }
                }
            }
        }
        return this._routs;
    }

    public static getCmd(route: string): Cmd {
        return this.instance.routs.get(route);
    }
}