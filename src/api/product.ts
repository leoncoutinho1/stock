import { http } from './client';
import { ProductDto, ProductPayload, ResultList } from './types';

export interface ProductFilter {
    description?: string;
    limit?: number;
    offset?: number;
}

export const productApi = {
    getProducts: async (filters?: ProductFilter) => {
        const params = new URLSearchParams();
        if (filters?.description) params.append("description", filters.description);
        if (filters?.limit) params.append("limit", filters.limit.toString());
        if (filters?.offset) params.append("offset", filters.offset.toString());

        const query = params.toString();
        const path = `/Product/ListProduct${query ? `?${query}` : ""}`;
        return http<ResultList<ProductDto>>(path);
    },

    searchProducts: async (text: string) => {
        return http<ProductDto[]>(`/Product/GetProductByDescOrBarcode/${encodeURIComponent(text)}`);
    },

    getProduct: (id: string) => http<ProductDto>(`/product/${id}`),

    createProduct: (payload: ProductPayload) =>
        http<ProductDto>("/product", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    updateProduct: (id: string, payload: ProductPayload) => {
        console.log("Updating product with id:", id);
        console.log("Payload:", payload);
        return http<ProductDto>(`/product/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    },


    deactivateProduct: (id: string) =>
        http<void>(`/product/${id}`, {
            method: "DELETE",
        }),
};
