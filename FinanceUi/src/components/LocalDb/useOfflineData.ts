import { useEffect, useState } from "react"




interface UseOfflineDataParams<T> {
    defaultData : T,
    getOnlineData : ()=>Promise<T>,
    initialData: () => Promise<T>,
    offlineOnly?: boolean
}



export function useOfflineData<T>(inputs : UseOfflineDataParams<T>, keys : any[]){
    if(!!inputs.defaultData) inputs.defaultData = null as T 
    const [data,setData] = useState<T>(inputs.defaultData)
    const [isLoading, setLoading] = useState<boolean>(true)
    const [isFetching, setFetching] = useState<boolean>(false)

    const fetch = (then) => {
        setFetching(true)
        inputs.getOnlineData().then((data) => {
            setData(data)
            then()
            setFetching(false)
            setLoading(false)
        }).catch((ex) => {
            setFetching(false)
            setLoading(false)
            throw ex;
        })
    }


    useEffect(() => {
        console.debug("called useOfflineData useEffect " + keys.join(","))
        let mode = "offline"
        let fetching = false
        let fetched = false
        setData(inputs.defaultData)
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
        setLoading(true)




        inputs.initialData().then((data)=>{
            setLoading(false)
            if (mode === "offline") setData(data)
            if (!fetching && !fetched && !inputs.offlineOnly ) fetch(
                ()=>{
                    mode = "online"
                    fetching = false
                    fetched = true
                })
        }).catch((ex) => {
            fetching = true
            fetch(
                ()=>{
                    mode = "online"
                    fetching = false
                    fetched = true
                }
            )
            throw ex
        })



    },keys)

    return {
        data,
        refetch : ()=>fetch(()=>{}),
        isFetching,
        isLoading
    }
}