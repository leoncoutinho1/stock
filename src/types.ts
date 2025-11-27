export type Product = {
  id: string;
  description: string;
  cost: number;
  price: number;
  quantity: number;
  barcode: string;
  image: string;
  ind_active: boolean;
};

export type Sale = {
  id: string;
  productId: string;
  quantity: number;
  timestamp: number;
};
