import { authApi } from './auth';
import { productApi } from './product';
import { saleApi } from './sale';

export * from './types';
export * from './client';
export * from './auth';
export * from './product';
export * from './sale';
export * from './category';
export * from './cashier';
export * from './paymentForm';
export * from './checkout';

// Unified API object for backward compatibility
export const api = {
    // Auth methods
    ...authApi,
    hasToken: authApi.isAuthenticated,

    // Product methods
    ...productApi,
    getProducts: productApi.getProducts,
    getProduct: productApi.getProduct,
    createProduct: productApi.createProduct,
    updateProduct: productApi.updateProduct,
    deactivateProduct: productApi.deactivateProduct,

    // Sale methods
    ...saleApi,
};
