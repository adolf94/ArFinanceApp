/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext } from "react";
import { IdToken } from "../Pages/Register";

export interface UserContextValue {
		get: IdToken | null,
		set: (data: any)=>void
}

export const UserContext = React.createContext<UserContextValue>({
//@ts-gnore
		get: null,
//@ts-gnore
		set: () => {} 
})



const useUserInfo = () => {
	const ctx = useContext(UserContext)
		const value = {
			user : ctx.get!,
			isInRole : (role :string) : boolean =>{
				if(!ctx.get?.role) return false
				if(Array.isArray(ctx.get!.role)){
					return ctx.get!.role.some((e :string )=>e.toLowerCase() == role.toLowerCase() || e.toLowerCase()==`${window.webConfig.app}_${role}`.toLowerCase())
				}
								
				if( typeof ctx.get!.role == "string" && (ctx.get!.role == role || ctx.get!.role ==`${window.webConfig.app}_${role}`) ) return true
				return false
			}
		}

		return value
}
export const useUpdateUserInfo = () => {
	const ctx = useContext(UserContext)
	   

		return ctx.set
}

export default useUserInfo