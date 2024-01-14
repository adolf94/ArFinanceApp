import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../components/api"
import { Vendor } from "FinanceApi"

export const VENDOR = "vendor"
export const fetchVendorsByType = () => {

}


export const useMutateVendor = () => {
  const queryClient = useQueryClient()

    const create = useMutation({
      mutateFn: (data : Partial<Vendor>) => {

        return api.post("vendors", data)
          .then(e=>e.data)
      },
      onSuccess: () => {
        queryClient.invalidateQueries(f\)
      }
    })

 
}

export { }