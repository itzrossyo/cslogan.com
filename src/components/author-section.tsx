import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export function AuthorSection() {
    return (
        <section id="author" className="py-20 px-4">
            <div className="container mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <h2 className="text-3xl font-bold mb-6">Meet the Author</h2>
                        <div className="prose prose-lg text-muted-foreground">
                            <p className="mb-4">
                                Jane Smith is a bestselling author with over 15 years of experience in digital transformation and
                                mindful living. Her unique approach combines practical wisdom with deep insights into human nature.
                            </p>
                            <p className="mb-4">
                                With a background in psychology and technology, Jane brings a fresh perspective to contemporary
                                challenges. Her books have helped thousands of readers navigate the complexities of modern life.
                            </p>
                            <p>
                                When she's not writing, Jane enjoys meditation, hiking, and spending time with her family in the Pacific
                                Northwest.
                            </p>
                        </div>
                    </div>
                    <div className="order-1 md:order-2">
                        <Card className="overflow-hidden">
                            <CardContent className="p-0">
                                <Image
                                    src="/placeholder.svg?height=500&width=400"
                                    alt="Author Jane Smith"
                                    width={400}
                                    height={500}
                                    className="w-full h-auto object-cover"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}
