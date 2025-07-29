export interface Book {
    id: string;
    title: string;
    author: string;
    bio?: string;
    description?: string;
    price: number;
    isFree: boolean;
    coverUrl: string;
    pdfUrl: string;
    createdAt?: any;
}

export interface Order {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    status: 'pending' | 'completed' | 'archived' | 'success';
    totalPrice?: number;
    postageCost?: number;
    items: Array<{
        title: string;
        interiorUrl: string;
        coverUrl: string;
        price?: number;
        author?: string;
        bio?: string;
        description?: string;
        pdfUrl?: string;
        isFree?: boolean;
        quantity?: number;
    }>;
}

export interface FinanceSummary {
    bookTitle: string;
    unitsSold: number;
    revenue: number;
}