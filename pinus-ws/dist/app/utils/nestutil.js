"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pinusAppProvider = exports.getNestClass = void 0;
const pinus_1 = require("pinus");
function getNestClass(app, classz, module) {
    const nestComponent = app.get('NestComponent');
    const nestApp = nestComponent.nestApp;
    const root = module ? nestApp.select(module) : nestApp;
    if (!root)
        return null;
    try {
        let cls = root.get(classz);
        return cls;
    }
    catch (e) {
        // 给RPC用来读取 方法名用的
        return classz.prototype;
    }
}
exports.getNestClass = getNestClass;
// pinus 需要先初始化
exports.pinusAppProvider = {
    provide: pinus_1.Application,
    useValue: pinus_1.pinus.app,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmVzdHV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvdXRpbHMvbmVzdHV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsaUNBQTJDO0FBRTNDLFNBQWdCLFlBQVksQ0FBQyxHQUFnQixFQUFFLE1BQVcsRUFBRSxNQUFZO0lBRXBFLE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUF5QyxDQUFDO0lBQ3ZGLE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUM7SUFDdEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7SUFFdkQsSUFBSSxDQUFDLElBQUk7UUFBRSxPQUFPLElBQUksQ0FBQztJQUV2QixJQUFJO1FBQ0EsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQixPQUFPLEdBQUcsQ0FBQztLQUNkO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixpQkFBaUI7UUFDakIsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDO0tBQzNCO0FBQ0wsQ0FBQztBQWZELG9DQWVDO0FBRUQsZUFBZTtBQUNGLFFBQUEsZ0JBQWdCLEdBQUc7SUFDNUIsT0FBTyxFQUFFLG1CQUFXO0lBQ3BCLFFBQVEsRUFBRSxhQUFLLENBQUMsR0FBRztDQUN0QixDQUFBIn0=