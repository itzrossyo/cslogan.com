"use client"

import { useState } from "react"
import Link from "next/link"
import { useCart } from "../context/CartContext"
import { Cart } from "@/components/cart"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Menu, BookOpen, ShoppingCart, User } from "lucide-react"


export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const [cartOpen, setCartOpen] = useState(false)
    const { cartItems, removeFromCart, updateQuantity } = useCart()

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    const navItems = [
        { href: "/", label: "Home" },
        { href: "/store", label: "Store" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
    ]

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                        <BookOpen className="h-6 w-6" />
                        <span className="font-bold text-xl "><span className="text-green-500">CS</span>logan</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-lg font-medium transition-colors hover:text-primary"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-2">
                        {/* Cart Sheet Trigger */}
                        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative">
                                    <ShoppingCart className="h-4 w-4" />
                                    {totalItems > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
                                            {totalItems}
                                        </span>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetTitle className="mb-4">Your Cart</SheetTitle>
                                <Cart

                                    items={cartItems}
                                    onRemove={removeFromCart}
                                    onUpdateQuantity={updateQuantity}
                                />
                            </SheetContent>
                        </Sheet>

                        {/* Admin Button */}
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/admin">
                                <User className="h-4 w-4" />
                            </Link>
                        </Button>

                        {/* Mobile Navigation */}
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <div className="flex flex-col space-y-4 mt-8">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="text-lg font-medium ml-8"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>
    )
}
