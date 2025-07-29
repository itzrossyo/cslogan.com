// types/cart.ts
export type CartItem = {
    id: string;
    title: string;
    author: string;
    image: string; // ⚠️ important: NOT optional
    price: number;
    quantity: number;
    description: string;
    formats: string[];
    isFree: boolean;
    pdfUrl?: string;
    coverUrl?: string;
    interiorUrl?: string;
};
