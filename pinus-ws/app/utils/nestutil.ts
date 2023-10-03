import { INestApplicationContext } from "@nestjs/common";
import { Application, pinus } from "pinus";

export function getNestClass(app: Application, classz: any, module?: any) {

    const nestComponent = app.get('NestComponent') as { nestApp: INestApplicationContext };
    const nestApp = nestComponent.nestApp;
    const root = module ? nestApp.select(module) : nestApp;

    if (!root) return null;

    try {
        let cls = root.get(classz);
        return cls;
    } catch (e) {
        // 给RPC用来读取 方法名用的
        return classz.prototype;
    }
}

// pinus 需要先初始化
export const pinusAppProvider = {
    provide: Application,
    useValue: pinus.app,
}
