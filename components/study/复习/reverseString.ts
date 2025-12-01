function reverseString(s:string[]):void{
    let left =0
    let right = s.length-1
    while(left < right){
        const isLeftSpecial = /[^a-zA-Z0-9]/.test(s[left])
        const isRightSpecial = /[^a-zA-Z0-9]/.test(s[right])

        if(isLeftSpecial){
            left++
        }else if(isRightSpecial){
            right--
        }else{
            [s[left],s[right]] = [s[right],s[left]]
        }
        left++
        right--
    }
}