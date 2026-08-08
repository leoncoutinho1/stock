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
    unit: string;
    categoryId: string;
    barcodes?: string[];
    imageUrl?: string;
    image?: string;
    isActive?: boolean;
    composite?: boolean;
    validityDays?: number;
    integrateScale?: boolean;
    mainBarcode?: string | null;
    componentProducts?: ProductCompositionDto[];
};

export type ProductDTO = {
    id: string;
    description: string;
    cost: number;
    price: number;
    profitMargin?: number;
    quantity: number;
    unit: string;
    categoryId: string;
    categoryDescription?: string;
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
    imageUrl?: string;
    image?: string;
    isActive?: boolean;
    composite?: boolean;
    validityDays?: number;
    integrateScale?: boolean;
    mainBarcode?: string | null;
    barcodes: string[];
    componentProducts?: ProductCompositionDto[];

    // Optional legacy fields for UI compatibility
    barCode?: string;
    costPrice?: number;
    stockQuantity?: number;
    photo?: string;
    categoryName?: string;
};

export type ProductDto = ProductDTO;

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

export type SalesTotalsDTO = {
    period: string;
    startDate: string;
    endDate: string;
    totalValue: number;
};
