"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore"
import { useCart } from "@/context/CartContext" // ✅ use cart context

export function BookCarousel() {
    const { addToCart } = useCart() // ✅ no prop needed

    const [books, setBooks] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % books.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + books.length) % books.length)
    }

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000)
        return () => clearInterval(timer)
    }, [books])

    useEffect(() => {
        const fetchBooks = async () => {
            const q = query(collection(db, "books"), orderBy("createdAt", "desc"), limit(5))
            const snap = await getDocs(q)
            const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
            setBooks(data)
        }
        fetchBooks()
    }, [])

    if (books.length === 0) return null

    return (
        <section className="py-20 px-4 bg-slate-50">
            <div className="container mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">Latest Additions</h2>

                <div className="relative max-w-4xl mx-auto">
                    <div className="flex items-center justify-center">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={prevSlide}
                            className="absolute left-0 z-10 bg-transparent"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-12">
                            {books.map((book, index) => (
                                <Card
                                    key={book.id}
                                    className={`transition-all duration-300 ${index === currentIndex ? "scale-105 shadow-lg" : "opacity-70"}`}
                                >
                                    <CardContent className="p-4">
                                        <div className="relative">
                                            <Image
                                                src={book.coverUrl || "/placeholder.svg"}
                                                alt={book.title}
                                                width={200}
                                                height={300}
                                                className="w-full h-64 object-cover rounded-md"
                                            />
                                            <span className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
                                                New
                                            </span>
                                        </div>
                                        <h3 className="font-semibold mt-4 mb-2">{book.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                                        <p className="font-bold text-lg">${parseFloat(book.price).toFixed(2)}</p>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                                        <Button className="w-full" onClick={() => addToCart(book)}>
                                            Add to Cart
                                        </Button>
                                        {book.isFree && (
                                            <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                                                <Button variant="outline" className="w-full">
                                                    Download Free PDF
                                                </Button>
                                            </a>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={nextSlide}
                            className="absolute right-0 z-10 bg-transparent"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex justify-center mt-6 space-x-2">
                        {books.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-3 h-3 rounded-full transition-colors ${index === currentIndex ? "bg-primary" : "bg-gray-300"}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
