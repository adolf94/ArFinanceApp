import { useEffect, useState } from "react"




interface UseOfflineDataParams<T> {
    defaultData : T,
    getOnlineData : ()=>Promise<T>,
    initialData: () => Promise<T>,
    offlineOnly: boolean
}



export function useOfflineData<T>(inputs : UseOfflineDataParams<T>, keys : any[]){
    if(!!inputs.defaultData) inputs.defaultData = null as T 
    const [data,setData] = useState<T>(inputs.defaultData)
    const [isLoading, setLoading] = useState<boolean>(true)
    const [isFetching, setFetching] = useState<boolean>(false)

    useEffect(() => {
        console.debug("called useOfflineData useEffect " + keys.join(","))
        let mode = "offline"
        let fetching = false
        let fetched = false
        //if (!isLoading) return;
        //const fetch = () => {
            //fetching = true
            ////setFetching(true)
            //inputs.getOnlineData().then((data) => {
            //    setData(data)
            //    mode = "online"
            //    setFetching(false)
            //    setLoading(false)
            //}).catch(() => {
            //    //setFetching(false)
            //    //setLoading(false)
        //})
        const fetch = () => {
            fetching = true
            inputs.getOnlineData().then((data) => {
                setData(data)
                mode = "online"
                fetching = false
                fetched = true
                setFetching(false)
                setLoading(false)
            }).catch((ex) => {
                setFetching(false)
                setLoading(false)
                throw ex;
            })
        }
        
        inputs.initialData().then((data)=>{
            setLoading(false)
            if (mode === "offline") setData(data)
            if (!fetching && !fetched && !inputs.offlineOnly ) fetch()
        })



    },keys)

    return {
        data,
        isFetching,
        isLoading
    }
}