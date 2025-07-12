"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface CartItem {
    id: string
    title: string
    author: string
    price: number
    image: string
    quantity: number
}

interface CartProps {
    items: CartItem[]
    onRemove: (id: string) => void
    onUpdateQuantity: (id: string, quantity: number) => void
}

export function Cart({ items, onRemove, onUpdateQuantity }: CartProps) {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    if (items.length === 0) {
        return (
            <div className="p-4 text-center">
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Button asChild>
                    <Link href="/store">Continue Shopping</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Shopping Cart</h2>

            <div className="space-y-4">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                        <Image src={item.coverUrl || "/placeholder.svg"} alt={item.title} width={60} height={80} className="rounded" />
                        <div className="flex-1">
                            <h3 className="font-medium text-sm">{item.title}</h3>
                            <p className="text-xs text-muted-foreground">{item.author}</p>
                            <div>
                                {item.image}
                            </div>
                            <p className="font-semibold">${item.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            >
                                <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => onUpdateQuantity(item.id, Number.parseInt(e.target.value) || 0)}
                                className="w-16 h-8 text-center"
                                min="0"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 bg-transparent"
                                onClick={() => onRemove(item.id)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>

            <Button className="w-full mt-4" asChild>
                <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
        </div>
    )
}
