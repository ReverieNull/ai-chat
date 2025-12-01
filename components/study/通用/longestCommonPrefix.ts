function longestCommonPrefix(strs: string[]):string{
    if(strs.length === 0)  return '';
    
    let prefix = strs[0]

    for(let i = 1;i <strs.length;i++){
        while(!strs[i].startsWith(prefix)){
            prefix = prefix.slice(0,prefix.length -1 ) 
            if(prefix === '') return ''
        }
    }

    return prefix
}
//最长公共前缀，传入一个字符串，先判断边界，然后准备开始遍历
//传入的可能是多个字母