"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeUtil = void 0;
var TimeUtil;
(function (TimeUtil) {
    class TimeManager {
        constructor() {
            // 时区偏移 +8 时区 需要 utc -8 小时偏移
            // 凌晨4点 需要 +4 小时偏移
            // 设置东八区凌晨4点为一天的开始
            this.daySecOffset = BigInt(-60 * 60 * 4);
            this.startTime = -1;
            this.timeScale = 1;
        }
        // 读取配置确定是否启动时间缩放
        theWorld() {
            let timeScale = Number(process.env.TIME_SCALE || 0);
            console.log('TimeUtil using timeScale', timeScale);
            if (timeScale) {
                this.startTime = Date.now();
                this.timeScale = Number(timeScale);
                console.log('TimeUtil.TimeManager using timeScale', this.timeScale);
            }
            else {
                this.startTime = -1;
                this.timeScale = 1;
                console.log('TimeUtil.TimeManager no timeScale', this.timeScale);
            }
        }
        timeScaleEnabled() {
            return this.startTime > 0 && this.timeScale != 1;
        }
        now() {
            if (this.timeScaleEnabled()) {
                const now = Date.now();
                const distance = now - this.startTime;
                const time = this.startTime + (distance * this.timeScale);
                console.log(`TimeUtil.now 
                        real: ${now} 
                        distance: ${distance}
                        scale: ${this.timeScale} 
                        scaled time: ${time}`);
                return time;
            }
            else {
                const now = Date.now();
                console.log(`TimeUtil.now no scale ${now}`);
                return now;
            }
        }
        biNow() {
            return BigInt(this.now());
        }
        nowSec() {
            const nowSec = Math.floor(this.now() / 1000);
            return BigInt(nowSec);
        }
        // 今天凌晨4点的时间戳
        todaySec() {
            const now = this.nowSec();
            return now - (now % 86400n) + this.daySecOffset;
        }
        // 某天凌晨4点的时间戳
        daySec(day) {
            const daySec = this.todaySec();
            return daySec + (BigInt(day) * 86400n);
        }
    }
    const timeManager = new TimeManager();
    // 检测是否启动时间缩放  砸瓦鲁多！
    function theWorld() {
        timeManager.theWorld();
    }
    TimeUtil.theWorld = theWorld;
    function now() {
        return timeManager.now();
    }
    TimeUtil.now = now;
    function biNow() {
        return timeManager.biNow();
    }
    TimeUtil.biNow = biNow;
    function timeScaleEnabled() {
        return timeManager.timeScaleEnabled();
    }
    TimeUtil.timeScaleEnabled = timeScaleEnabled;
    function nowSec() {
        return timeManager.nowSec();
    }
    TimeUtil.nowSec = nowSec;
    function todaySec() {
        return timeManager.todaySec();
    }
    TimeUtil.todaySec = todaySec;
    function daySec(day) {
        return timeManager.daySec(day);
    }
    TimeUtil.daySec = daySec;
})(TimeUtil = exports.TimeUtil || (exports.TimeUtil = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvdXRpbHMvdGltZVV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsSUFBaUIsUUFBUSxDQThHeEI7QUE5R0QsV0FBaUIsUUFBUTtJQUVyQixNQUFNLFdBQVc7UUFBakI7WUFFSSw0QkFBNEI7WUFDNUIsa0JBQWtCO1lBQ2xCLGtCQUFrQjtZQUNWLGlCQUFZLEdBQUcsTUFBTSxDQUFDLENBQUUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUVyQyxjQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDZixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBb0UxQixDQUFDO1FBbEVHLGlCQUFpQjtRQUNqQixRQUFRO1lBRUosSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRXBELE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFFbkQsSUFBSSxTQUFTLEVBQUU7Z0JBQ1gsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLHNDQUFzQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUN2RTtpQkFDSTtnQkFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztnQkFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDcEU7UUFDTCxDQUFDO1FBRUQsZ0JBQWdCO1lBQ1osT0FBTyxJQUFJLENBQUMsU0FB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