import { http } from './client';
import { ResultList, SaleDTO } from './types';

export const saleApi = {
    getSales: async (params?: { limit?: number; offset?: number; updatedAt?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('Limit', params.limit.toString());
        if (params?.offset) queryParams.append('Offset', params.offset.toString());
        if (params?.updatedAt) queryParams.append('UpdatedAt', params.updatedAt);

        const query = queryParams.toString();
        const path = query ? `/Sale/ListSale?${query}` : '/Sale/ListSale';

        const res = await http<ResultList<any>>(path);
        return res;
    },

    getSale: (id: string) => http<SaleDTO>(`/Sale/${id}`),

    createSale: (sale: SaleDTO) =>
        http<SaleDTO>("/Sale", {
            method: "POST",
            body: JSON.stringify(sale),
        }),

    deleteSale: (id: string) =>
        http<void>(`/Sale/${id}`, {
            method: "DELETE",
        }),
};
