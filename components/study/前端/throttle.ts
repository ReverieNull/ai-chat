function throttle<T extends (...args: any[]) => any>(
    fn:T,
    interval:number
){
    let lastTime = 0
    let timer: NodeJS.Timeout | null = null;

    const throttled = function(this: any, ...args: Parameters<T>){
        const currentTime = Date.now();  //获取当前时间
        const reminingTime = interval - (currentTime - lastTime)
        //当前时间减去上次时间，interval减去该差值，即固定时间减去上次和当前时间的差值
        if(reminingTime <= 0){ //差值小于零的时候 说明间隔大于传入时间，间隔达标
            if(timer) {clearTimeout(timer);timer=null}
            fn.apply(this,args)
            lastTime = currentTime;
        }else if(!timer){ //间隔不达标的时候 再执行定时器，时间为remingingtime
            //执行后将时间更新并清空定时器
            timer = setTimeout(()=>{
                fn.apply(this,args)
                lastTime = Date.now()
                timer = null
            },reminingTime)
        }
    }
    throttled.cancel = function(){
        if(timer) clearTimeout(timer)
        timer = null
        lastTime = 0
    }
    return throttled
}