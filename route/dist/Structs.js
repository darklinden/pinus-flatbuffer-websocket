"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Structs = void 0;
const RouteBase_1 = require("./RouteBase");
const FooBar_1 = require("./FooBar");
class Structs {
    constructor() {
        this.m_FooBar = null;
        this._routs = null;
        this.m_FooBar = new FooBar_1.FooBar();
    }
    static get FooBar() { return this.instance.m_FooBar; }
    static get instance() {
        if (!this._instance)
            this._instance = new Structs();
        return this._instance;
    }
    get routs() {
        if (!this._routs) {
            this._routs = new Map();
            for (const key in this) {
                if (Object.prototype.hasOwnProperty.call(this, key)) {
                    const element = this[key];
                    if (element instanceof RouteBase_1.RouteBase) {
                        for (let [key, value] of element.getMap()) {
                            this._routs.set(key, value);
                        }
                    }
                }
            }
        }
        return this._routs;
    }
    static getCmd(route) {
        return this.instance.routs.get(route);
    }
}
exports.Structs = Structs;
Structs._instance = null;
//# sourceMappingURL=Structs.js.map