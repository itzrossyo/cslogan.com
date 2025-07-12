"use client"

import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Book {
    id: string
    title: string
    author: string
    price: number
    image: string
    description: string
    formats: string[] // ["PDF", "EPUB"]
    isFree: boolean
    pdfUrl?: string // <- NEW
}


interface BookGridProps {
    books: Book[]
    onAddToCart: (book: Book) => void
}

export function BookGrid({ books, onAddToCart }: BookGridProps) {
    const handleDownload = (book: Book, format: string) => {
        if (format === "PDF" && book.pdfUrl) {
            const link = document.createElement("a")
            link.href = book.pdfUrl
            link.download = `${book.title}.pdf`
            link.click()
        } else {
            alert("Download not available for this format.")
        }
    }


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
                <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                        <div className="relative">


                            <Image
                                src={book.coverUrl || "/placeholder.svg"}
                                alt={book.title}
                                width={300}
                                height={400}
                                className="w-full h-64 object-cover"
                            />




                            {book.isFree && <Badge className="absolute top-2 right-2 bg-green-500">Free</Badge>}
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{book.author}</p>
                            <p className="text-sm mb-4 line-clamp-2">{book.description}</p>
                            <p className="font-bold text-xl">${book.price}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex gap-2">
                        {book.isFree && book.pdfUrl ? (
                            <Button
                                onClick={() => window.open(book.pdfUrl, "_blank")}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                Free PDF
                            </Button>
                        ) : (
                            <Button onClick={() => onAddToCart(book)} className="flex-1">
                                Add to Cart
                            </Button>
                        )}

                        {book.isFree && (
                            <Button
                                onClick={() => onAddToCart(book)}

                                variant="outline"
                                className="flex-1"
                            >
                                Buy Hard Copy
                            </Button>
                        )}

                        {book.formats?.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {book.formats.map((format) => (
                                        <DropdownMenuItem key={format}>
                                            Download {format}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </CardFooter>


                </Card>
            ))}
        </div>
    )
}
