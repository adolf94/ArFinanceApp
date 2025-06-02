import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Vendor } from "FinanceApi";
import { queryClient } from "../App";
import { sortBy } from 'lodash'
import replaceById from "../common/replaceById";
import fnApi from "../components/fnApi";

export const VENDOR = "vendor";
export const fetchVendors = () => {
  return fnApi("vendors").then((e) => {
    e.data.forEach((vendor) => {
      queryClient.setQueryData([VENDOR, { id: vendor.id }], vendor);
    });
      return sortBy(e.data,"name");
  });
};
export const fetchVendorById = async (id: string, force?:boolean) => {

    let vendor = null;



    let vendors = queryClient.getQueryData<Vendor[]>([VENDOR]);
    if (!force) {
        if (!vendors) vendors = await queryClient.ensureQueryData({ queryKey: [VENDOR], queryFn: () => fetchVendors() })
        vendor = vendors.find(e=>e.id === id)
    }
    if(!!vendor) return vendor

    return fnApi("vendors/" + id).then((e) => {
        return e.data;
        
    });
};

export const useMutateVendor = () => {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (data: Partial<Vendor>) => {
      return fnApi.post("vendors", data).then((e) => e.data);
    },
    onSuccess: (data: Vendor) => {
        queryClient.setQueryData<Vendor[]>([VENDOR], (prev) => {
            let newData = replaceById(data, (prev || []));
            return sortBy(newData, "name")
        });
        queryClient.setQueryData([VENDOR, { id: data.id }], data);
    },
  });

  return { create: create.mutateAsync, loading: create.isPending };
};
