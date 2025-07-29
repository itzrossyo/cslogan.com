// /app/store/page.tsx
"use client";

import { useEffect, useState } from "react";
import { BookGrid } from "@/components/book-grid";
import { Cart } from "@/components/cart";
import { ShoppingCart, Search, Filter, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";

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
  coverUrl: string;
  interiorUrl: string;
}

export default function StorePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "free" | "paid">("all");
  const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, "books"));
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Ensure coverUrl and interiorUrl exist
          coverUrl: doc.data().coverUrl || "https://example.com/default-cover.pdf",
          interiorUrl: doc.data().pdfUrl || "https://example.com/default-interior.pdf",
        })) as Book[];
        setBooks(data);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" ||
      (filterType === "free" && book.isFree) ||
      (filterType === "paid" && !book.isFree);
    return matchesSearch && matchesFilter;
  });

  const freeBooks = books.filter(book => book.isFree);
  //const paidBooks = books.filter(book => !book.isFree);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-200 to-gray-400 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-3 rounded-full">
              <BookOpen className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Your Next Great Read
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Explore our collection of transformative books designed to inspire and educate
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search books by title or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  All Books
                </Button>
                <Button
                  variant={filterType === "free" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("free")}
                  className="relative"
                >
                  Free Books
                  {freeBooks.length > 0 && (
                    <Badge className="ml-2 bg-green-500 text-white px-2 py-1 text-xs">
                      {freeBooks.length}
                    </Badge>
                  )}
                </Button>

              </div>
            </div>

            {/* Cart Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative group">
                  <ShoppingCart className="h-4 w-4 transition-transform group-hover:scale-110" />
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 text-xs flex items-center justify-center animate-pulse">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Your Cart
                </SheetTitle>
                <Cart
                  items={cartItems as any}
                  onRemove={removeFromCart}
                  onUpdateQuantity={updateQuantity}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Results Summary */}
        {searchTerm && (
          <div className="mb-6">
            <p className="text-gray-600">
              Found <strong>{filteredBooks.length}</strong> books matching &#34;{searchTerm}&#34;
            </p>
          </div>
        )}

        {/* Featured Badge for Free Books */}
        {filterType === "free" && freeBooks.length > 0 && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <div className="bg-green-500 p-2 rounded-full">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Free Books Available!</h3>
                <p className="text-green-700 text-sm">Start your journey with our complimentary collection</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          /* Books Grid */
          <BookGrid books={filteredBooks} onAddToCart={addToCart as any} />
        )}

        {/* Empty State */}
        {!loading && filteredBooks.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No books found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? `No books match your search for "${searchTerm}"`
                : "No books available in this category"
              }
            </p>
            {searchTerm && (
              <Button onClick={() => setSearchTerm("")} variant="outline">
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </div >
  );
}