import { useEffect, useState } from "react"




interface UseOfflineDataParams<T> {
    defaultData : T,
    getOnlineData : ()=>Promise<T>,
    initialData: () => Promise<T>,
    offlineOnly: boolean
}



export function useOfflineData<T>(inputs : UseOfflineDataParams<T>, keys : any[]){
    if(!!inputs.defaultData) inputs.defaultData = null as T | null
    const [data,setData] = useState<T>(inputs.defaultData)
    const [isLoading, setLoading] = useState<boolean>(true)
    const [isFetching, setFetching] = useState<boolean>(false)
    const [fetched, setFetched] = useState<boolean>(false)

    useEffect(()=>{
        let mode = "offline"
        let fetched = false
        let fetching = isFetching
        setLoading(true)
        //const fetch = () => {
            fetching = true
            setFetching(true)
            inputs.getOnlineData().then((data) => {
                setData(data)
                mode = "online"
                fetched = true
                fetching = false
                setFetching(false)
                setLoading(false)
            }).catch(() => {
                setFetching(false)
                setLoading(false)
            })
        
        inputs.initialData().then((data)=>{
            setLoading(false)
            if (mode === "offline") setData(data)
            //if (!fetching && !fetched && !inputs.offlineOnly ) fetch()
        })



    },[keys])

    return {
        data,
        isFetching,
        isLoading
    }
}