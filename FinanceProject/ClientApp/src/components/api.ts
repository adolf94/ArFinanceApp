import axios from 'axios'


const api = axios.create({
  baseURL:"https://localhost:7129/api"
})


export default api