import { http } from './client';
import { SaleItemDto, SaleDTO, ResultList } from './types';

export const saleApi = {
    getSales: async () => {
        const res = await http<ResultList<any>>("/Sale/ListSale");
        return res.data;
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
