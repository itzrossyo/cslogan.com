// /components/book-grid.tsx
"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, ShoppingCart, Eye, Star, BookOpen, Check, X } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface Book {
    id: string;
    title: string;
    author: string;
    price: number;
    image: string;
    description: string;
    formats: string[];
    isFree: boolean;
    pdfUrl?: string;
    coverUrl?: string;
    interiorUrl?: string;
}

interface BookGridProps {
    books: Book[];
    onAddToCart: (book: Book) => void;
}

interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error';
    visible: boolean;
}

export function BookGrid({ books, onAddToCart }: BookGridProps) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [toastId, setToastId] = useState(0);
    const [emailModalOpen, setEmailModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [email, setEmail] = useState("");
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const newToast: Toast = {
            id: toastId,
            message,
            type,
            visible: true
        };

        setToasts(prev => [...prev, newToast]);
        setToastId(prev => prev + 1);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.map(toast =>
                toast.id === newToast.id
                    ? { ...toast, visible: false }
                    : toast
            ));
        }, 3000);

        // Remove from array after animation
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== newToast.id));
        }, 3500);
    };

    const handleAddToCart = (book: Book) => {
        onAddToCart(book);
        showToast(`"${book.title}" added to cart!`, 'success');
    };

    const handleDownload = (book: Book, format: string) => {
        if (format === "PDF" && book.pdfUrl) {
            const link = document.createElement("a");
            link.href = book.pdfUrl;
            link.download = `${book.title}.pdf`;
            link.click();
            showToast(`Downloading "${book.title}" as PDF`, 'success');
        } else {
            showToast("Download not available for this format.", 'error');
        }
    };

    const handlePreview = (url: string) => {
        if (url) {
            window.open(url, "_blank");
        }
    };

    const handleFreeDownload = (book: Book) => {
        setSelectedBook(book);
        setEmailModalOpen(true);
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBook || !email) return;

        setIsSendingEmail(true);
        try {
            const response = await fetch('/api/send-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    bookTitle: selectedBook.title,
                    pdfUrl: selectedBook.pdfUrl,
                    author: selectedBook.author,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showToast(`PDF sent to ${email}!`, 'success');
                setEmailModalOpen(false);
                setEmail("");
                setSelectedBook(null);
            } else {
                showToast(data.error || 'Failed to send PDF', 'error');
            }
        } catch (error) {
            console.error('Error sending PDF:', error);
            showToast('Failed to send PDF. Please try again.', 'error');
        } finally {
            setIsSendingEmail(false);
        }
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.map(toast =>
            toast.id === id
                ? { ...toast, visible: false }
                : toast
        ));
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 500);
    };

    return (
        <>
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border
                            transform transition-all duration-300 ease-in-out
                            ${toast.visible
                                ? 'translate-x-0 opacity-100'
                                : 'translate-x-full opacity-0'
                            }
                            ${toast.type === 'success'
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                            }
                        `}
                    >
                        <div className={`
                            flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center
                            ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}
                        `}>
                            {toast.type === 'success' ? (
                                <Check className="w-3 h-3 text-white" />
                            ) : (
                                <X className="w-3 h-3 text-white" />
                            )}
                        </div>

                        <span className="text-sm font-medium flex-1">
                            {toast.message}
                        </span>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Email Modal */}
            <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Get Your Free PDF</DialogTitle>
                        <DialogDescription>
                            Enter your email address to receive &ldquo;{selectedBook?.title}&rdquo; by {selectedBook?.author}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <Input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={isSendingEmail || !email}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            >
                                {isSendingEmail ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 mr-2" />
                                        Send PDF
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setEmailModalOpen(false);
                                    setEmail("");
                                    setSelectedBook(null);
                                }}
                                disabled={isSendingEmail}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Book Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book) => (
                    <Card key={book.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-0 relative">
                            <div className="relative overflow-hidden">
                                <Image
                                    src={book.coverUrl || "/placeholder.svg"}
                                    alt={book.title}
                                    width={300}
                                    height={400}
                                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                                />

                                {/* Overlay with actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                                    {book.interiorUrl && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handlePreview(book.interiorUrl!)}
                                            className="bg-white/90 hover:bg-white text-black"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Preview
                                        </Button>
                                    )}

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="bg-white/90 hover:bg-white text-black"
                                            >
                                                <BookOpen className="w-4 h-4 mr-1" />
                                                Details
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>{book.title}</DialogTitle>
                                                <DialogDescription>
                                                    by {book.author}
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 mt-4">
                                                <div>
                                                    <span className="font-semibold">Price:</span> £{book.price.toFixed(2)}
                                                </div>
                                                <div>
                                                    <span className="font-semibold">Description:</span>
                                                    <p className="mt-1 text-sm text-muted-foreground">{book.description}</p>
                                                </div>
                                                {book.formats?.length > 0 && (
                                                    <div>
                                                        <span className="font-semibold">Available Formats:</span>
                                                        <div className="flex gap-1 mt-1">
                                                            {book.formats.map((format) => (
                                                                <Badge key={format} variant="outline" className="text-xs">
                                                                    {format}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                {/* Badges */}
                                <div className="absolute top-2 right-2 flex flex-col gap-1">

                                    {book.price > 0 && (
                                        <Badge className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg">
                                            £{book.price.toFixed(2)}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 space-y-3">
                                <div>
                                    <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {book.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
                                </div>

                                <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                    {book.description}
                                </p>

                                {/* Rating placeholder - you can connect this to real ratings */}
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    <span className="text-sm text-muted-foreground ml-1">(4.8)</span>

                                </div>
                            </div>

                        </CardContent>

                        <CardFooter className="p-4 pt-0 flex flex-col gap-2">

                            <div className="flex gap-2 w-full">

                                {book.isFree && book.pdfUrl ? (
                                    <Button
                                        onClick={() => handleFreeDownload(book)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 transition-colors"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Free PDF
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleAddToCart(book)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 transition-colors"
                                    >
                                        <ShoppingCart className="w-4 h-4 mr-2" />
                                        Add to Cart
                                    </Button>
                                )}

                                {book.formats?.length > 0 && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon" className="hover:bg-gray-100">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {book.formats.map((format) => (
                                                <DropdownMenuItem
                                                    key={format}
                                                    onClick={() => handleDownload(book, format)}
                                                    className="cursor-pointer"
                                                >
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download {format}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>

                            {book.isFree && (
                                <Button
                                    onClick={() => handleAddToCart(book)}
                                    variant="outline"
                                    className="w-full hover:bg-gray-50 transition-colors"
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Buy Physical Copy
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </>
    );
}