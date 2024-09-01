import { useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../components/api"
import { Vendor } from "FinanceApi"
import { queryClient } from "../App"

export const VENDOR = "vendor"
export const fetchVendors = () => {
  return api("vendors")
    .then(e => {
      e.data.forEach(vendor => {
        queryClient.setQueryData([VENDOR, {id: vendor.id}], vendor)
      })
      return e.data
    })
}
export const fetchVendorById = (id:string) => {
  return api("vendors/" + id)
    .then(e => {
      return e.data
    })
}

export const useMutateVendor = () => {
  const queryClient = useQueryClient()

  const create = useMutation({
      mutationFn: (data: Partial<Vendor>) => {
        return api.post("vendors", data)
          .then(e => e.data)
      },
      onSuccess: (data : Vendor) => {
        queryClient.setQueryData<Vendor[]>([VENDOR], prev=>[...(prev || []), data])
        queryClient.setQueryData([VENDOR, {id: data.id}], data)
      }
    })

  return {create: create.mutateAsync}
}
