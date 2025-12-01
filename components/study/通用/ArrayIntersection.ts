


export default function intersection(nums1:number[],nums2:number[]){
    if(nums1.length> nums2.length) [nums1,nums2] = [nums2,nums1]
    //哈希表优化，短数组建表，去重逻辑，delete避免重复，边界情况
    const numSet = new Set(nums1)
    const result: number[] = []
    
    for(const num of nums2){
        if(numSet.has(num)){ //nums1中有nums2的元素
            result.push(num) //放到结果中
            numSet.delete(num) //删除表中的已有元素
        }
    }
    return result
}

//数组相同区间，以短数组建表比较节省
function myArrayIntersection(nums1:number[],nums2:number[]){
    if(nums1.length < nums2.length) [nums1,nums2] = [nums2,nums1]
    const myset = new Set(nums1)
    const result:number[] = []

    for(const num of nums1){
        if(myset.has(num)){
            result.push(num)
            myset.delete(num)
        }
    }
    }
