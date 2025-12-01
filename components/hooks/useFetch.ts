//数据请求
import { useState,useEffect,useCallback } from "react"
import api from '@/utils/axiosInstance'

type FetchResult<T>={
    data:T | null
    loading: boolean
    error: string | null
    refetch: () => void
}
export default function useFetch<T>(url:string,dependencies:any[]=[]):FetchResult<T>{
    const [data,setdata] = useState<T|null>(null)
    const [loading,setLoading] = useState(false)
    const [error,setError] = useState<string|null>(null)

    const fetchdata = useCallback(async ()=>{
        setLoading(true)
        setError(null)
        try{
            const res = await api.get(url)
            setdata(res.data.data)
        }catch(err:any){
            setError(err.message || '请求失败')
        }finally{
            setLoading(false)
        }
    },[url]
    )

        useEffect(()=>{
            fetchdata()
        },[fetchdata,...dependencies])
        return {data,loading,error,refetch: fetchdata
        }
}