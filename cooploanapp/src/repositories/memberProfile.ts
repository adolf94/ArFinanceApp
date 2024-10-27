import { useMutation } from "@tanstack/react-query"
import api from "../components/api"

export const MEMBER_PROFILE = "memberProfile"

export const getMemberProfiles = (year : number)=>{
    return api(`/memberProfiles/${year}`)
        .then(e=>e.data)
}

export const useMutateMemberProfile = ()=>{


    const create = useMutation({
        mutationFn : ( data : any)=>{
            return api.put(`/users/${data.userId}/memberProfiles/${data.year}` , data)
                .then(e=>e.data)
        }

    })
    return {create}
}