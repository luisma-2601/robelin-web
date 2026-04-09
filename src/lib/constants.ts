export const PRODUCT_CATEGORIES = [
  'Cuidado Capilar',
  'Barbería',
  'Manicura',
  'Peluquería'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
