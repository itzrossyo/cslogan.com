"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { CartItem } from '@/types/cart';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (book: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    isLoaded: boolean;
}

export const CartContext = createContext<CartContextType>({
    cartItems: [],
    addToCart: () => {},
    removeFromCart: () => {},
    updateQuantity: () => {},
    clearCart: () => {},
    isLoaded: false,
});

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const clearCart = () => {
        setCartItems([]);
    };

    useEffect(() => {
        const loadCart = () => {
            try {
                const stored = localStorage.getItem("cart");
                if (stored && stored !== "undefined" && stored !== "null") {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        const validItems = parsed.filter((item: any) => {
                            const isValid =
                                item &&
                                typeof item.id === "string" &&
                                typeof item.title === "string" &&
                                typeof item.author === "string" &&
                                typeof item.price === "number" &&
                                typeof item.quantity === "number" &&
                                typeof item.description === "string" &&
                                (!item.formats || Array.isArray(item.formats)) &&
                                typeof item.coverUrl === "string" &&
                                typeof item.interiorUrl === "string";

                            if (!isValid) console.log("Invalid item found:", item);
                            return isValid;
                        });

                        setCartItems(validItems);
                    } else {
                        localStorage.removeItem("cart");
                    }
                }
            } catch (error) {
                console.error("Error loading cart from localStorage:", error);
                localStorage.removeItem("cart");
            } finally {
                setIsLoaded(true);
            }
        };

        const timer = setTimeout(loadCart, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem("cart", JSON.stringify(cartItems));
            } catch (error) {
                console.error("Error saving cart to localStorage:", error);
            }
        }
    }, [cartItems, isLoaded]);

    const addToCart = (book: CartItem) => {
        if (!book.id || !book.title || !book.author || typeof book.price !== "number") {
            console.error("Book missing required fields:", book);
            return;
        }

        const normalizedBook: CartItem = {
            ...book,
            formats: book.formats && Array.isArray(book.formats) ? book.formats : ["PDF"],
        };

        setCartItems((prev) => {
            const existing = prev.find((b) => b.id === book.id);
            if (existing) {
                return prev.map((b) =>
                    b.id === book.id ? { ...b, quantity: b.quantity + 1 } : b
                );
            }
            return [...prev, { ...normalizedBook, quantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setCartItems((prev) => prev.filter((b) => b.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) {
            return removeFromCart(id);
        }
        setCartItems((prev) =>
            prev.map((b) => (b.id === id ? { ...b, quantity } : b))
        );
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                isLoaded,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}
