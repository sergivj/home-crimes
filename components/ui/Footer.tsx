"use client"

import Link from "next/link"
import { Mail, Instagram, Facebook, Twitter } from "lucide-react"
import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="w-full border-t border-border bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="text-2xl font-bold text-primary">🔍</div>
              <span className="text-xl font-bold">Home Crimes</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#products" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('products')}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('howItWorks')}
                </Link>
              </li>
              <li>
                <Link href="/game-access" className="text-muted-foreground hover:text-foreground transition-colors">
                  {t('accessGame')}
                </Link>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="font-semibold mb-4">{t('faq')}</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">{t('faqItems.access')}</li>
              <li className="text-muted-foreground">{t('faqItems.included')}</li>
              <li className="text-muted-foreground">{t('faqItems.shipping')}</li>
              <li className="text-muted-foreground">{t('faqItems.return')}</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{t('contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail size={16} />
                <span>support@homecrimes.com</span>
              </li>
              <li className="flex space-x-3 mt-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter size={20} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Home Crimes. {t('copyright')}</p>
        </div>
      </div>
    </footer>
  )
}