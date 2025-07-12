"use client"

import { createContext, useContext, useEffect, useState } from "react"

export const CartContext = createContext({
    cartItems: [],
    addToCart: (book: any) => { },
    removeFromCart: (id: string) => { },
    updateQuantity: (id: string, quantity: number) => { },
})

export const useCart = () => useContext(CartContext)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<any[]>([])

    useEffect(() => {
        const stored = localStorage.getItem("cart")
        if (stored) setCartItems(JSON.parse(stored))
    }, [])

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cartItems))
    }, [cartItems])

    const addToCart = (book: any) => {
        setCartItems((prev) => {
            const existing = prev.find((b) => b.id === book.id)
            if (existing) {
                return prev.map((b) =>
                    b.id === book.id ? { ...b, quantity: b.quantity + 1 } : b
                )
            }
            return [...prev, { ...book, quantity: 1 }]
        })
    }

    const removeFromCart = (id: string) => {
        setCartItems((prev) => prev.filter((b) => b.id !== id))
    }

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity <= 0) return removeFromCart(id)
        setCartItems((prev) =>
            prev.map((b) => (b.id === id ? { ...b, quantity } : b))
        )
    }

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity }}>
            {children}
        </CartContext.Provider>
    )
}
