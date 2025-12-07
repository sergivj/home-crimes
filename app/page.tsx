import Header from "@/components/ui/Header"
import Footer from "@/components/ui/Footer"
import Hero from "@/components/ui/Hero"
import ProductShowcase from "@/components/ui/ProductShowcase"
import Testimonials from "@/components/ui/Testimonial"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <ProductShowcase />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}