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
exports.EntryHandler = void 0;
const pinus_1 = require("pinus");
const route_1 = require("route");
const nestutil_1 = require("../../../utils/nestutil");
const common_1 = require("@nestjs/common");
const user_enter_service_1 = require("../../../domain/teller/user-enter/user-enter.service");
function default_1(app) {
    return (0, nestutil_1.getNestClass)(app, EntryHandler);
}
exports.default = default_1;
let EntryHandler = class EntryHandler {
    constructor(app, userEnterService) {
        this.app = app;
        this.userEnterService = userEnterService;
    }
    /**
     * New client entry chat server.
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     */
    async enter(msg, session) {
        return await this.userEnterService.enter(this.app, msg, session);
    }
};
__decorate([
    (0, route_1.MarkRoute)('Home', route_1.proto.RequestUserEnter, route_1.proto.ResponseUserEnter),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, pinus_1.FrontendSession]),
    __metadata("design:returntype", Promise)
], EntryHandler.prototype, "enter", null);
EntryHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pinus_1.Application,
        user_enter_service_1.UserEnterService])
], EntryHandler);
exports.EntryHandler = EntryHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnlIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY29ubmVjdG9yL2hhbmRsZXIvZW50cnlIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFxRDtBQUNyRCxpQ0FBeUM7QUFDekMsc0RBQXVEO0FBQ3ZELDJDQUE0QztBQUM1Qyw2RkFBd0Y7QUFFeEYsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBQSx1QkFBWSxFQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUMzQyxDQUFDO0FBRkQsNEJBRUM7QUFHRCxJQUFhLFlBQVksR0FBekIsTUFBYSxZQUFZO0lBQ3JCLFlBQ1ksR0FBZ0IsRUFDUCxnQkFBa0M7UUFEM0MsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQUNQLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7SUFHdkQsQ0FBQztJQUVEOzs7OztPQUtHO0lBRUgsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFRLEVBQUUsT0FBd0I7UUFDMUMsT0FBTyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckUsQ0FBQztDQUNKLENBQUE7QUFIRztJQURDLElBQUEsaUJBQVMsRUFBQyxNQUFNLEVBQUUsYUFBSyxDQUFDLGdCQUFnQixFQUFFLGFBQUssQ0FBQyxpQkFBaUIsQ0FBQzs7NkNBQ3BDLHVCQUFlOzt5Q0FFN0M7QUFqQlEsWUFBWTtJQUR4QixJQUFBLG1CQUFVLEdBQUU7cUNBR1EsbUJBQVc7UUFDVyxxQ0FBZ0I7R0FIOUMsWUFBWSxDQWtCeEI7QUFsQlksb0NBQVkifQ==