/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext } from "react";
import { IdToken } from "../Pages/IndexComponents/Register";

export interface UserContextValue {
		get: IdToken,
		set: React.SetStateAction<IdToken>
}

export const UserContext = React.createContext<UserContextValue>({
//ts-gnore
		get: null,
//ts-gnore
		set: () => {}
})



const useUserInfo = () => {
	const ctx = useContext(UserContext)
	   
		const value = {
			user : ctx.get
		}

		return value
}
export const useUpdateUserInfo = () => {
	const ctx = useContext(UserContext)
	   

		return ctx.set
}

export default useUserInfo