"use client";

import { Clock, Users, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";

interface Product {
  id: number | string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  players: string;
  difficulty: string;
  image: string;
  bestseller: boolean;
  publishedAt: string | null;
}

interface ProductApiResponse {
  data?: Product[];
  error?: string;
}

export default function ProductShowcase() {
  const t = useTranslations('products');
  const tHow = useTranslations('howItWorks');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const response = await fetch('/api/products?published=true&limit=10');
        const payload: ProductApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || 'Failed to load products');
        }

        setProducts(payload.data || []);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load products';
        setError(message);
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <section id="products" className="w-full py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('title')}</h2>
          <p className="text-lg text-black/50 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-black/50">Loading products...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-black/50">No products available at the moment.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow h-full flex-col bg-transparent py-0"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover w-full h-[186px] max-w-full opacity-100"
                  />

                  {product.bestseller && (
                    <div className="absolute top-4 right-4 bg-primary px-3 py-1 rounded-md text-xs font-semibold">
                      {t('bestseller')}
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="text-xl">{product.title}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-black/50">
                    <Clock className="mr-2 h-4 w-4" />
                    {product.duration}
                  </div>
                  <div className="flex items-center text-sm text-black/50">
                    <Users className="mr-2 h-4 w-4" />
                    {product.players}
                  </div>
                  <div className="flex items-center text-sm text-black/50">
                    <Star className="mr-2 h-4 w-4" />
                    {t('difficulty')}: {product.difficulty}
                  </div>
                </CardContent>

                <div className="flex justify-between items-center px-6 pb-6">
                  <div className="text-2xl font-bold">
                    {product.currency === 'USD' ? '$' : product.currency}
                    {product.price}
                  </div>
                  <Link
                    href={`/products/${product.slug}`}
                    className="py-1 px-4 bg-black text-white hover:bg-white hover:text-black border transition rounded-md"
                  >
                    {t('buyNow')}
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div id="how-it-works" className="mt-24">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">{tHow('title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto text-2xl font-bold text-primary rounded-full p-4 bg-gray-200">
                1
              </div>
              <h4 className="text-xl font-semibold">{tHow('step1.title')}</h4>
              <p className="text-black/50">
                {tHow('step1.description')}
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto text-2xl font-bold text-primary rounded-full p-4 bg-gray-200">
                2
              </div>
              <h4 className="text-xl font-semibold">{tHow('step2.title')}</h4>
              <p className="text-black/50">
                {tHow('step2.description')}
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto text-2xl font-bold text-primary rounded-full p-4 bg-gray-200">
                3
              </div>
              <h4 className="text-xl font-semibold">{tHow('step3.title')}</h4>
              <p className="text-black/50">
                {tHow('step3.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
