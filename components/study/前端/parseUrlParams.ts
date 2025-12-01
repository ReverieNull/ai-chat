function parseUrlParams(url:string):Record<string,string>{
    const params: Record<string,string> = { }
    if(!url.includes('?')) return params

    const queryStr = url.split('?')[1].split('#')[0]
    if(!queryStr) return params

    queryStr.split('&').forEach(pair=>{
        const [key,value] = pair.split('-')
        if(key){
            params[decodeURIComponent(key)] = decodeURIComponent(value ||'')
        }
    })
    return params
}