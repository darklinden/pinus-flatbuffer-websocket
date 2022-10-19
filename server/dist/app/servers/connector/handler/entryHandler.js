"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handler = void 0;
const pinus_1 = require("pinus");
const flatbuffers = require("flatbuffers");
const route_1 = require("route");
function default_1(app) {
    return new Handler(app);
}
exports.default = default_1;
class Handler {
    constructor(app) {
        this.app = app;
        this.onFooReturnBuilder = new flatbuffers.Builder(16);
        this.onBarReturnBuilder = new flatbuffers.Builder(16);
    }
    logBytes(bytes) {
        let str = "<bytes len: " + bytes.length + ' ';
        str += '[';
        for (var i = 0; i < bytes.length; i++) {
            if (i > 0) {
                str += ' ';
            }
            let tmp = ('0' + bytes[i].toString(16));
            str += tmp.length > 2 ? tmp.substring(tmp.length - 2) : tmp;
        }
        str += ']>';
        console.log(str);
    }
    /**
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     */
    async onFoo(msg, session) {
        const req = msg;
        console.log('onFoo', req.foo());
        this.onFooReturnBuilder.clear();
        let bar = new route_1.proto.BarT(req.foo()).pack(this.onFooReturnBuilder);
        this.onFooReturnBuilder.finish(bar);
        let buff = this.onFooReturnBuilder.asUint8Array();
        this.logBytes(buff);
        return buff;
    }
    /**
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     */
    async onBar(msg, session) {
        const req = msg;
        console.log('onBar', req.bar());
        this.onBarReturnBuilder.clear();
        let foo = new route_1.proto.FooT(req.bar()).pack(this.onBarReturnBuilder);
        this.onBarReturnBuilder.finish(foo);
        let buff = this.onBarReturnBuilder.asUint8Array();
        this.logBytes(buff);
        return buff;
    }
}
__decorate([
    (0, route_1.MarkRoute)('FooBar', route_1.proto.Foo, route_1.proto.Bar),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pinus_1.FrontendSession]),
    __metadata("design:returntype", Promise)
], Handler.prototype, "onFoo", null);
__decorate([
    (0, route_1.MarkRoute)('FooBar', route_1.proto.Bar, route_1.proto.Foo),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pinus_1.FrontendSession]),
    __metadata("design:returntype", Promise)
], Handler.prototype, "onBar", null);
exports.Handler = Handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29ubmVjdG9yL2hhbmRsZXIvZW50cnlIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUNBLGlDQUFxRDtBQUVyRCwyQ0FBMkM7QUFDM0MsaUNBQWtEO0FBRWxELG1CQUF5QixHQUFnQjtJQUNyQyxPQUFPLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQWEsT0FBTztJQUNoQixZQUFvQixHQUFnQjtRQUFoQixRQUFHLEdBQUgsR0FBRyxDQUFhO1FBb0I1Qix1QkFBa0IsR0FBRyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFxQmpELHVCQUFrQixHQUFHLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQXZDekQsQ0FBQztJQUVTLFFBQVEsQ0FBQyxLQUFpQjtRQUNoQyxJQUFJLEdBQUcsR0FBRyxjQUFjLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFDOUMsR0FBRyxJQUFJLEdBQUcsQ0FBQztRQUNYLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDUCxHQUFHLElBQUksR0FBRyxDQUFDO2FBQ2Q7WUFFRCxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDeEMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztTQUMvRDtRQUNELEdBQUcsSUFBSSxJQUFJLENBQUM7UUFFWixPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFJRDs7OztPQUlHO0lBRUcsQUFBTixLQUFLLENBQUMsS0FBSyxDQUFDLEdBQVEsRUFBRSxPQUF3QjtRQUMxQyxNQUFNLEdBQUcsR0FBRyxHQUFpQixDQUFDO1FBRTlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRWhDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQyxJQUFJLEdBQUcsR0FBRyxJQUFJLGFBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUlEOzs7O09BSUc7SUFFRyxBQUFOLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBUSxFQUFFLE9BQXdCO1FBQzFDLE1BQU0sR0FBRyxHQUFHLEdBQWlCLENBQUM7UUFFOUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFFaEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2hDLElBQUksR0FBRyxHQUFHLElBQUksYUFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDbEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBdUNKO0FBdkVTO0lBREwsSUFBQSxpQkFBUyxFQUFDLFFBQVEsRUFBRSxhQUFLLENBQUMsR0FBRyxFQUFFLGFBQUssQ0FBQyxHQUFHLENBQUM7OzZDQUNYLHVCQUFlOztvQ0FXN0M7QUFVSztJQURMLElBQUEsaUJBQVMsRUFBQyxRQUFRLEVBQUUsYUFBSyxDQUFDLEdBQUcsRUFBRSxhQUFLLENBQUMsR0FBRyxDQUFDOzs2Q0FDWCx1QkFBZTs7b0NBVzdDO0FBN0RMLDBCQW9HQyJ9