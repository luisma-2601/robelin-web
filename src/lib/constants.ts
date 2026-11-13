export const PRODUCT_CATEGORIES = [
  'Cuidado Capilar',
  'Barbería',
  'Manicura',
  'Peluquería'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

/** Número de WhatsApp de la tienda (formato internacional sin "+", ej. 584141234567). */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
