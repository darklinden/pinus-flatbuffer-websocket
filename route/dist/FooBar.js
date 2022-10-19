"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FooBar = void 0;
const Cmd_1 = require("./Cmd");
const RouteBase_1 = require("./RouteBase");
const internal_1 = require("./proto/internal");
class FooBar extends RouteBase_1.RouteBase {
    constructor() {
        super(...arguments);
        this.OnFoo = Cmd_1.Cmd.create('connector.entryHandler.onFoo', internal_1.proto.Foo, internal_1.proto.Bar);
        this.OnBar = Cmd_1.Cmd.create('connector.entryHandler.onBar', internal_1.proto.Bar, internal_1.proto.Foo);
    }
}
exports.FooBar = FooBar;
//# sourceMappingURL=FooBar.js.map