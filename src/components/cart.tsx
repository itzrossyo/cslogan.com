"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Package } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
//import Link from "next/link"
import { CartItem}  from "@/types/cart";
import { useRouter } from "next/navigation"



interface CartProps {
    items: CartItem[]
    onRemove: (id: string) => void
    onUpdateQuantity: (id: string, quantity: number) => void
    onClose?: () => void
}

export function Cart({ items, onRemove, onUpdateQuantity, onClose }: CartProps) {
    const router = useRouter()
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    const handleCheckout = () => {
        if (onClose) {
            onClose()
        }
        router.push("/checkout")
    }

    const handleContinueShopping = () => {
        if (onClose) {
            onClose()
        }
        router.push("/store")
    }

    if (items.length === 0) {
        return (
            <div className="p-6 text-center space-y-4">
                <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Your cart is empty</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                        Discover amazing books and add them to your cart
                    </p>
                </div>
                <Button onClick={handleContinueShopping} className="w-full">
                    <Package className="w-4 h-4 mr-2" />
                    Continue Shopping
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800">Shopping Cart</h2>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </Badge>
                </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-4">
                                <div className="relative">
                                    <Image
                                        src={item.coverUrl || item.image || "/placeholder.svg"}
                                        alt={item.title}
                                        width={60}
                                        height={80}
                                        className="rounded-md object-cover border"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm leading-tight mb-1 line-clamp-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-2">
                                        by {item.author}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-blue-600">
                                            £{item.price.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            £{(item.price * item.quantity).toFixed(2)} total
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-gray-100"
                                        onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <div className="w-12 text-center">
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => onUpdateQuantity(item.id, Math.max(0, Number.parseInt(e.target.value) || 0))}
                                            className="w-12 h-8 text-center border-gray-300"
                                            min="0"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-gray-100"
                                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                    onClick={() => onRemove(item.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer with Total and Checkout */}
            <div className="border-t bg-white p-4 space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal ({itemCount} items):</span>
                        <span className="font-medium">£{total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping:</span>
                        <span className="font-medium text-green-600">FREE</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span className="text-blue-600">£{total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={handleCheckout}
                    >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Proceed to Checkout
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleContinueShopping}
                    >
                        Continue Shopping
                    </Button>
                </div>
            </div>
        </div>
    )
}