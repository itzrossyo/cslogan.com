import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Award } from "lucide-react"

export function AuthorSection() {
    const achievements = [
        { icon: BookOpen, label: "Author", color: "bg-blue-100 text-blue-800" },
        { icon: Users, label: "Reader Focused", color: "bg-green-100 text-green-800" },
        { icon: Award, label: "Published Writer", color: "bg-purple-100 text-purple-800" }
    ]

    const interests = ["Digital Transformation", "Mindful Living", "Psychology", "Technology"]

    return (
        <section id="author" className="py-24 px-4 bg-gradient-to-br from-slate-50 to-blue-50/30">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent mb-4">
                        Meet the Author
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Discover the mind behind the words that have transformed thousands of lives
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Author Image */}
                    <div className="order-2 lg:order-1 relative">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                            <Card className="relative overflow-hidden border-0 shadow-2xl">
                                <CardContent className="p-0">
                                    <Image
                                        src="https://firebasestorage.googleapis.com/v0/b/cslogancom.firebasestorage.app/o/author.png?alt=media&token=9aa5898f-a73c-45b0-b37c-004b658183e3"
                                        alt="Author Jane Smith"
                                        width={500}
                                        height={600}
                                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Floating Stats */}
                        <div className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-lg border hidden md:block">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-slate-900">📚</div>
                                <div className="text-sm text-muted-foreground">Published Author</div>
                            </div>
                        </div>

                        <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-lg border hidden md:block">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-slate-900">✨</div>
                                <div className="text-sm text-muted-foreground">Transformative</div>
                            </div>
                        </div>
                    </div>

                    {/* Author Content */}
                    <div className="order-1 lg:order-2 space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900">Christian</h3>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {achievements.map((achievement, index) => (
                                    <Badge key={index} variant="secondary" className={`${achievement.color} px-3 py-1 text-sm font-medium`}>
                                        <achievement.icon className="w-4 h-4 mr-1" />
                                        {achievement.label}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6 text-lg leading-relaxed text-slate-700">
                            <p>
                                Christian is an author with experience in digital transformation and
                                mindful living. Her unique approach combines practical wisdom with deep
                                insights into human nature.
                            </p>

                            <p>
                                With a background in psychology and technology, Christian brings a fresh perspective
                                to contemporary challenges. Her books have helped readers navigate
                                the complexities of modern life.
                            </p>

                            <p>
                                When he&#39;s not writing, Christian enjoys meditation, hiking, and spending time with her family
                                in the Pacific Northwest.
                            </p>
                        </div>

                        {/* Interests/Expertise */}
                        <div>
                            <h4 className="text-lg font-semibold mb-3 text-slate-900">Areas of Expertise</h4>
                            <div className="flex flex-wrap gap-2">
                                {interests.map((interest, index) => (
                                    <Badge key={index} variant="outline" className="px-3 py-1 text-sm hover:bg-slate-100 transition-colors">
                                        {interest}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Quote */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-l-4 border-blue-500">
                            <blockquote className="text-lg italic text-slate-700 mb-2">
                                &#34;Writing is about connecting with readers and sharing insights that can make a difference
                                in their daily lives.&#34;
                            </blockquote>
                            <cite className="text-sm font-medium text-slate-600">— Christian</cite>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}