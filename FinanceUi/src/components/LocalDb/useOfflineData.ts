import { useEffect, useState } from "react"




interface UseOfflineDataParams<T> {
    defaultData : T,
    getOnlineData : ()=>Promise<T>,
    initialData: () => Promise<T>,
    offlineOnly: boolean
}



export function useOfflineData<T>(inputs : UseOfflineDataParams<T>, keys : any[]){
    if(!!inputs.defaultData) inputs.defaultData = null
    const [data,setData] = useState<T>(inputs.defaultData)
    const [isLoading, setLoading] = useState<boolean>(true)
    const [isFetching, setFetching] = useState<boolean>(true)
    const [fetched, setFetched] = useState<boolean>(false)

    useEffect(()=>{
        let mode = "offline"
        let fetched = false
        setLoading(true)
        const fetch = ()=>inputs.getOnlineData().then((data) => {
            setData(data)
            mode = "online"
            fetched = true
            setFetching(false)
        }).catch(() => {
            setFetching(false)
            setLoading(false)
        })

        
        inputs.initialData().then((data)=>{
            setLoading(false)
            if (mode === "offline") setData(data)
            if (!isFetching && !fetched && !inputs.offlineOnly ) fetch()
        })



    },keys)

    return {
        data,
        isFetching,
        isLoading
    }
}