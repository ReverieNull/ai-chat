function removeElement(nums:number[],val:number):number{
    let slow = 0 //定义慢指针
    for(let fast = 0;fast< nums.length;fast++){ //定义快指针，遍历数组
        if(nums[fast] !== val){  //没有找到目标值
            nums[slow] = nums[fast] //刚开始两者相等
            slow++ //挪动慢指针
        } //[0，1,2,3,4，5]
        //slow = 0  fast = 0  val = 2
        //第一轮， fast = 0 ，slow = 0，，执行if后 slow =1
        //第二轮，fast = 1， slow=1， 执行if 后slow = 2
        //第三轮，fast=2，不符合if条件，不执行，slow=2
        //第四轮，fast = 3，符合if，fast也就是用nums2 = nums[3] 用值往前挪一位，把目标值占掉，slow=3
        //第五轮，fast = 4，if后slow=4
        //第六轮，fast=5，if后slow=5，结束，输出slow，即去除元素后数组长度
    }
    return slow;
}

//传入数组和值，返回移除后的数组，用快慢指针