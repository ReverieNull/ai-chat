function objectDeepCompare(a:any,b:any){
    //基本类型/引用类型相同
    if(a === b) return true

    //排除null,因为typeof null === 'object'
    if(a === null || b === null) return false
    if(typeof a !== 'object' || typeof b !== 'object') return false 

    //数组对比，比较长度再逐个递归
    if(Array.isArray(a) && Array.isArray(b)){
        if(a.length !== b.length) return false
        for(let i = 0; i<a.length;i++){
            if(!objectDeepCompare(a[i],b[i])) return false
        }
        return true
    }

    //对象比较，先比构造函数，再比属性数量，最后递归属性值
    if(a.constructor === b.constructor) return false
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if(keysA.length !== keysB.length) return false

    for(const key of keysA){
        if(!keysB.includes(key) || !objectDeepCompare(a[key],b[key])) return false
    }
    return true
}