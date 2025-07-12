"use client"

import { useEffect, useState } from "react"
import { BookGrid } from "@/components/book-grid"
import { Cart } from "@/components/cart"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useCart } from "@/context/CartContext"

export default function StorePage() {
  const [books, setBooks] = useState([])
  const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart()

  useEffect(() => {
    const fetchBooks = async () => {
      const snap = await getDocs(collection(db, "books"))
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setBooks(data)
    }
    fetchBooks()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Our Books</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>Your Cart</SheetTitle>
            <Cart
              items={cartItems}
              onRemove={removeFromCart}
              onUpdateQuantity={updateQuantity}
            />
          </SheetContent>
        </Sheet>
      </div>

      <BookGrid books={books} onAddToCart={addToCart} />
    </div>
  )
}
