"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proto = void 0;
const bar_1 = require("./bar");
const color_1 = require("./color");
const foo_1 = require("./foo");
const map_xdata_row_1 = require("./map-xdata-row");
const map_xdata_1 = require("./map-xdata");
const vec3_1 = require("./vec3");
var proto;
(function (proto) {
    proto.Bar = bar_1.Bar;
    proto.BarT = bar_1.BarT;
    proto.Color = color_1.Color;
    proto.Foo = foo_1.Foo;
    proto.FooT = foo_1.FooT;
    proto.MapXDataRow = map_xdata_row_1.MapXDataRow;
    proto.MapXDataRowT = map_xdata_row_1.MapXDataRowT;
    proto.MapXData = map_xdata_1.MapXData;
    proto.MapXDataT = map_xdata_1.MapXDataT;
    proto.Vec3 = vec3_1.Vec3;
    proto.Vec3T = vec3_1.Vec3T;
})(proto = exports.proto || (exports.proto = {}));
//# sourceMappingURL=internal.js.map