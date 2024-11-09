import api from "../components/api"


export const LOAN_PROFILE = "loanProfile"



export const getAll = () => {

		return api.get("loanprofile")
				.then((res) => {

					return res.data


				})


}