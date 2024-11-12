import { useMutation } from "@tanstack/react-query"
import api from "../components/api"
import {LoanProfile} from "FinanceApi";
import {queryClient} from "../App";


export const LOAN_PROFILE = "loanProfile"



export const getAll = () => {
		return api.get("loanprofile")
				.then((res) => {
					return res.data
				})
}

export const useMutateLoanProfile = () => {

	const create = useMutation({
		mutationFn : ( data : any)=>{
			return api.post("/loanprofile", data)
				.then((res) => {
					return res.data
				})
		},
		onSuccess : ()=>{
			queryClient.invalidateQueries({queryKey: [LOAN_PROFILE]})
		}

	})
	
	return {create}
}