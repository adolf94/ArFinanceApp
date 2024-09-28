/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext } from "react";

interface UserContextGetValue {

}

export interface UserContextValue {
		get: any,
		set: React.SetStateAction<any>
}

export const UserContext = React.createContext<UserContextValue>({
		get: null,
		set: () => {}
})



const useUserInfo = () => {
	const ctx = useContext(UserContext)
	   
		const value = {
			user : ctx.get
		}

		return value
}

export default useUserInfo