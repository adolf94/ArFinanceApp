import { useLiveQuery } from "dexie-react-hooks"
import { useEffect, useState } from "react"
import { queryClient } from "../../App"
import { EnsureQueryDataOptions, QueryKey } from "@tanstack/react-query"

interface UseDexieDataWithQuery<T> {
    dexieData :  () => Promise<T> | T,
    queryParams : EnsureQueryDataOptions<T,Error,T, QueryKey, never>,
    initialData? : T,
    dataToDbFunction? : (data : T)=>Promise<any>
}

interface UseDexieDataWithQueryOutput<T>{
    data : T | undefined
    isLoading: boolean
}

export function  useDexieDataWithQuery<T>( props : UseDexieDataWithQuery<T>, deps) : UseDexieDataWithQueryOutput<T> {
    const [queryLoad, setQueryLoading] = useState(true)
    const [loading, setLoading] = useState(true)
    const [outputData,setOutputData] = useState<T|undefined>(undefined)


    // const outputData = useLiveQuery<T>(()=>props.dexieData(),[...deps,loading])

    useEffect(()=>{
        queryClient.ensureQueryData<T>(props.queryParams)
        .then(async (data)=>{
            if(props.dataToDbFunction) await props.dataToDbFunction(data)
            setQueryLoading(false)
            return data
        })
    },[])

    useEffect(()=>{
        new Promise(async (resolve)=>{
            let output = await props.dexieData()
            resolve(output)
        }).then((d : T | undefined)=>{
            setLoading(false)
            setOutputData(d)
        })            
    },[...deps, queryLoad])

    return {
        data : outputData || props.initialData,
        isLoading : loading
    }
} 

export default useDexieDataWithQuery;