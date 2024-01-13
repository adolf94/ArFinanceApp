import axios from "axios";
//@ts-ignore
const api = axios.create({
    //@ts-ignore
    baseURL: window.webConfig.api
})


export default api