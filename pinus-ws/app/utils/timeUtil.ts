export namespace TimeUtil {

    class TimeManager {

        // 时区偏移 +8 时区 需要 utc -8 小时偏移
        // 凌晨4点 需要 +4 小时偏移
        // 设置东八区凌晨4点为一天的开始
        private daySecOffset = BigInt(- 60 * 60 * 4);

        private startTime = -1;
        private timeScale = 1;

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

        timeScaleEnabled(): boolean {
            return this.startTime > 0 && this.timeScale != 1;
        }

        now(): number {
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

        biNow(): bigint {
            return BigInt(this.now());
        }

        nowSec(): bigint {
            const nowSec = Math.floor(this.now() / 1000);
            return BigInt(nowSec);
        }

        // 今天凌晨4点的时间戳
        todaySec(): bigint {
            const now = this.nowSec();
            return now - (now % 86400n) + this.daySecOffset;
        }

        // 某天凌晨4点的时间戳
        daySec(day: number | bigint): bigint {
            const daySec = this.todaySec();
            return daySec + (BigInt(day) * 86400n);
        }
    }

    const timeManager = new TimeManager();

    // 检测是否启动时间缩放  砸瓦鲁多！
    export function theWorld() {
        timeManager.theWorld();
    }

    export function now(): number {
        return timeManager.now();
    }

    export function biNow(): bigint {
        return timeManager.biNow();
    }

    export function timeScaleEnabled(): boolean {
        return timeManager.timeScaleEnabled();
    }

    export function nowSec(): bigint {
        return timeManager.nowSec();
    }

    export function todaySec(): bigint {
        return timeManager.todaySec();
    }

    export function daySec(day: number | bigint): bigint {
        return timeManager.daySec(day);
    }
}