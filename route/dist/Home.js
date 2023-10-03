"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Home = void 0;
const Cmd_1 = require("./Cmd");
const RouteBase_1 = require("./RouteBase");
const internal_1 = require("./proto/internal");
class Home extends RouteBase_1.RouteBase {
    constructor() {
        super(...arguments);
        this.Enter = Cmd_1.Cmd.create('connector.entryHandler.enter', internal_1.proto.RequestUserEnter, internal_1.proto.ResponseUserEnter);
    }
}
exports.Home = Home;
//# sourceMappingURL=Home.js.map