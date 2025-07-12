import { HeroSection } from "@/components/hero-section"
import { AuthorSection } from "@/components/author-section"
import { BookCarousel } from "@/components/book-carousel"

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <AuthorSection />
      <BookCarousel /> {/* no need to pass anything */}
    </div>
  )
}
