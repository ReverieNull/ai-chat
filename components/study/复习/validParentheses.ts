function validParenthese(str:string):boolean{
    const stack:string[] = []
    const map:any = {'}':'{',')':'(',']':'['}

    for(const char of str){
        if(char in map){
        if(stack.length ===0 || stack.pop() !== map[char]) return false
        }else{
            stack.push(char)
        }
    }

    return stack.length === 0
}