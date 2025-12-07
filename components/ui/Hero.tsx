"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative w-full overflow-hidden bg-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-[50px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="inline-flex items-center rounded-full bg-gray-500/20 px-4 py-1.5 text-sm font-medium text-primary">
                {t('badge')}
              </span>
            </div>
            
            <h1 className="text-6xl md:text-6xl font-bold tracking-tight whitespace-pre-line w-[80%]">
              {t('title')}
              <span className="text-primary"> {t('titleHighlight')}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground w-[77.1%] h-full max-w-[77.1%]">
              {t('description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="text-base" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>
                {t('shopButton')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </div>
              <div className="text-base" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                {t('howItWorksButton')}
              </div>
            </div>

            <div className="flex items-center gap-8 pt-6">
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-muted-foreground">{t('stats.casesSolved')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold">4.9★</div>
                <div className="text-sm text-muted-foreground">{t('stats.rating')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold">2-6</div>
                <div className="text-sm text-muted-foreground">{t('stats.players')}</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative h-[400px] md:h-[600px]">
            <Image
              src="https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&q=80"
              alt="Mystery Detective Game"
              fill
              className="object-cover rounded-2xl shadow-2xl"
              priority />
          </div>
        </div>
      </div>
    </section>);
}