"use client"

// import { Card, CardContent } from "@/components/ui/card"
import { useTranslations } from 'next-intl'
import { Card, CardContent } from './card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Mystery Enthusiast",
    content: "The Mansion Mystery was incredible! The production quality is top-notch, and the digital access made it so easy to track our clues. We solved it in one amazing evening!",
    rating: 1
  },
  {
    name: "Michael Chen",
    role: "Game Night Host",
    content: "Perfect for our monthly game nights. The Art Heist had everyone engaged from start to finish. Love the private online area for managing our investigation.",
    rating: 5
  },
  {
    name: "Emma Rodriguez",
    role: "Detective Fiction Fan",
    content: "As a huge mystery fan, I was blown away by the attention to detail. The Hotel Enigma challenged us in the best way possible. Can't wait to try another one!",
    rating: 5
  }
]

export default function Testimonials() {
  const t = useTranslations('testimonials');

  return (
    <section id="testimonials" className="w-full py-20 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('title')}</h2>
          <p className="text-lg text-black/50 max-w-2xl mx-auto">
            Join hundreds of satisfied sleuths who've cracked our cases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-primary fill-black" />
                  ))}
                  {[...Array(5-testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-primary fill-white" />
                  ))}
                </div>
                <p className="text-black/50 italic">&quot;{testimonial.content}&quot;</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-black/50">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}