"use client"

import { useCart } from "@/context/CartContext"
import { CheckoutForm } from "@/components/checkout-form"
import { OrderSummary } from "@/components/order-summary"

export default function CheckoutPage() {
    const { cartItems } = useCart()

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return (
        <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h1 className="text-3xl font-bold mb-6">Checkout</h1>
                <CheckoutForm />
            </div>

            <div>
                <OrderSummary items={cartItems} total={total} />
            </div>
        </div>
    )
}
