import {useState,useEffect} from 'react'


export default function useLocalStorage<T>(key:string,initialValue:T):[T,(value:T)=>void]{
    const [value,setValue] = useState<T>(()=>{
        try{
            const stored = localStorage.getItem(key)
            return  stored ? JSON.parse(stored) : initialValue
        }catch(err){
            console.error('读取失败',err)
            return initialValue
        }
    })

    useEffect(()=>{
        try{
            localStorage.setItem(key,JSON.stringify(value))
        }catch(err){
            console.error('写入失败',err)
        }
    },[key,value])

    return [value,setValue]
}
