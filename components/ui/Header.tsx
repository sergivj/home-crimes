"use client"

import Link from "next/link"
// import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // const t = useTranslations('header')

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary">🔍</div>
            <span className="text-xl font-bold">Home Crimes</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/#products" className="text-sm font-medium hover:text-primary transition-colors">
              {('products')}
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              {('howItWorks')}
            </Link>
            <LanguageSwitcher />
            <Link href="/game-access">
              <div >{('accessGame')}</div>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-3">
            <Link
              href="/#products"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {('products')}
            </Link>
            <Link
              href="/#how-it-works"
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {('howItWorks')}
            </Link>
            <div className="py-2">
              <LanguageSwitcher />
            </div>
            <Link href="/game-access" onClick={() => setMobileMenuOpen(false)}>
              <div className="w-full">{('accessGame')}</div>
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}