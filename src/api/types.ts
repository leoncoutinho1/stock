export type ProductCompositionDto = {
    componentProductId: string;
    componentProductDescription?: string;
    quantity: number;
    componentProductPrice?: number;
    componentProductCost?: number;
};

export type ProductPayload = {
    description: string;
    cost: number;
    price: number;
    quantity: number;
    barcodes: string[];
    categoryId: string;
    unit: string;
    image?: string;
    isActive?: boolean;
    composite?: boolean;
    componentProducts?: ProductCompositionDto[];
};

export type ProductDto = ProductPayload & { id: string };

export type SaleProductDTO = {
    saleId?: string;
    productId: string;
    unitPrice: number;
    quantity: number;
    discount: number;
    product?: ProductDto;
};

export type SaleDTO = {
    id?: string;
    checkoutId: string;
    cashierId: string;
    totalValue: number;
    paidValue: number;
    changeValue: number;
    overallDiscount: number;
    paymentFormId: string;
    createdAt?: string;
    saleProducts: SaleProductDTO[];
};

export type SaleItemDto = {
    id: string;
    saleId: string;
    productId: string;
    quantity: number;
    timestamp: number;
};

export type TokenDto = {
    accessToken: string;
    refreshToken: string;
};

export type ResultList<T> = {
    data: T[];
    totalCount: number;
};
