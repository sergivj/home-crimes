"use client";

// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star } from "lucide-react";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { fetchProducts } from '@/app/actions/product.actions';
import type { ProductResponse } from '@/modules/products/application/dto/product.dto';

export default function ProductShowcase() {
  const t = useTranslations('products');
  const tHow = useTranslations('howItWorks');
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const result = await fetchProducts({ published: true, limit: 10 });
        
        if (result.success && result.data) {
          setProducts(result.data);
        } else {
          setError(result.error || 'Failed to load products');
        }
      } catch (err) {
        setError('Failed to load products');
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
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading products...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products available at the moment.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
          </div>   
        )}

        {/* How It Works */}
        <div id="how-it-works" className="mt-24">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">{tHow('title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl font-bold text-primary">
                1
              </div>
              <h4 className="text-xl font-semibold">{tHow('step1.title')}</h4>
              <p className="text-muted-foreground">
                {tHow('step1.description')}
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl font-bold text-primary">
                2
              </div>
              <h4 className="text-xl font-semibold">{tHow('step2.title')}</h4>
              <p className="text-muted-foreground">
                {tHow('step2.description')}
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-2xl font-bold text-primary">
                3
              </div>
              <h4 className="text-xl font-semibold">{tHow('step3.title')}</h4>
              <p className="text-muted-foreground">
                {tHow('step3.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>);
}