import Footer from "@/components/ui/Footer";
import Header from "@/components/ui/Header";
import Hero from "@/components/ui/Hero";
import ProductShowcase from "@/components/ui/ProductShowcase";
import Testimonials from "@/components/ui/Testimonial";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <ProductShowcase />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
