import { http } from './client';
import { ProductDto, ProductPayload, ResultList } from './types';

export interface ProductFilter {
    description?: string;
    limit?: number;
    offset?: number;
}

export const productApi = {
    getProducts: async (offsetOrFilter?: number | ProductFilter, limit?: number) => {
        let filters: ProductFilter = {};
        if (typeof offsetOrFilter === 'number') {
            filters.offset = offsetOrFilter;
            filters.limit = limit;
        } else if (offsetOrFilter) {
            filters = offsetOrFilter;
        }

        const params = new URLSearchParams();
        if (filters?.description) params.append("description", filters.description);
        if (filters?.limit !== undefined) params.append("limit", filters.limit.toString());
        if (filters?.offset !== undefined) params.append("offset", filters.offset.toString());

        const query = params.toString();
        const path = `/Product/ListProduct${query ? `?${query}` : ""}`;
        return http<ResultList<ProductDto>>(path);
    },

    searchProducts: async (text: string) => {
        return http<ProductDto[]>(`/Product/GetProductByDescOrBarcode/${encodeURIComponent(text)}`);
    },

    getProduct: (id: string | number) => http<ProductDto>(`/product/${id}`),
    getProductById: (id: string | number) => http<ProductDto>(`/product/${id}`),

    createProduct: (payload: ProductPayload) =>
        http<ProductDto>("/product", {
            method: "POST",
            body: JSON.stringify(payload),
        }),

    updateProduct: (id: string | number, payload: Partial<ProductPayload>) => {
        return http<ProductDto>(`/product/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
    },

    deactivateProduct: (id: string | number) =>
        http<void>(`/product/${id}`, {
            method: "DELETE",
        }),

    deleteProduct: (id: string | number) =>
        http<void>(`/product/${id}`, {
            method: "DELETE",
        }),
};
