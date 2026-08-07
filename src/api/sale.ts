import { http } from "./client";
import { ResultList, SaleDTO, SalesTotalsDTO } from "./types";

export const saleApi = {
  getSales: async (params?: { limit?: number; sort?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("Limit", params.limit.toString());
    if (params?.sort) queryParams.append("Sort", params.sort);

    const query = queryParams.toString();
    const path = query ? `/Sale/ListSale?${query}` : "/Sale/ListSale";

    const res = await http<ResultList<any>>(path);
    return res;
  },

  getSale: async (id: string) => {
    try {
      const res = await http<any>(`/Sale/${id}`);
      return res?.data || res;
    } catch (e) {
      try {
        const res2 = await http<any>(`/Sale/GetSaleById/${id}`);
        return res2?.data || res2;
      } catch (e2) {
        throw e;
      }
    }
  },

  createSale: (sale: any) =>
    http<any>("/Sale", {
      method: "POST",
      body: JSON.stringify(sale),
    }),

  deleteSale: (id: string) =>
    http<void>(`/Sale/${id}`, {
      method: "DELETE",
    }),

  getSalesTotals: () => http<SalesTotalsDTO[]>("/Sale/GetSalesTotals"),
};
