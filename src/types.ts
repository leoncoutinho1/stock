export type Product = {
  id: string;
  description: string;
  cost: number;
  price: number;
  quantity: number;
  barcode: string;
  image: string;
};

export type Sale = {
  id: string;
  productId: string;
  quantity: number;
  timestamp: number;
};