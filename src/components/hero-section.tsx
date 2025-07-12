import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
    return (
        <section className="relative py-20 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="container mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    Welcome to <span className="text-green-500">CS</span>Logan Bookstore
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Welcome to the official publishing space of Christian, where each story is penned with heart, purpose, and imagination. Discover original works across fiction, memoirs, and more — all written, crafted, and independently published by the author.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" asChild>
                        <Link href="/store">Browse Books</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                        <Link href="#author">Meet the Author</Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
