interface TreeNode{
    val:number;
    left?: TreeNode |null;
    right?: TreeNode | null;
}

function levelOrder(root:TreeNode|null):number[][] {
    const result: number[][] = []
    if(!root) return result
    const queue: TreeNode[] = [root] //队列存                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        储当前层节点

    while(queue.length >0){
        const levelSize = queue.length
        const currentLevel:number[] = []

        for(let i =0;i< levelSize;i++){
            const node = queue.shift()!
            currentLevel.push(node.val)

            if(node.left) queue.push(node.left)
            if(node.right) queue.push(node.right)
        }
        result.push(currentLevel)
    }

    return  result
}

/*
interface TreeNode{
    val:number
    left?: TreeNode | null
    right?; TreeNode | null
}

function levelOrder(root:TreeNode|null):number[][]{
    const result:number[][] = []
    if(!root)  return []
    const queue:TreeNode[] = [root]

    while(levellength>0){
        const levelSize = queue.length
        const currentlevel:number[] = []
        for(let i =0;i<levellengthl;i++){
            const node = queue.shift()!
            currentlevel.push(node.val)

            if(node.left)  queue.push(node.left)
            if(node.left)  queue.push(node.right)
        }
            result.push(currentlevel)
    }
    return result

}

*/