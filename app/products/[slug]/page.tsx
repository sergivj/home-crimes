import type { ReactNode } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Clock, Download, ShieldCheck, Star, Users } from "lucide-react";
import CheckoutButton from "@/components/ui/CheckoutButton";
import Footer from "@/components/ui/Footer";
import Header from "@/components/ui/Header";
import { getProductBySlug } from "@/lib/strapi/api";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const t = await getTranslations("productDetail");
  const includedItemsRaw = t.raw("whatsIncluded.items");
  const includedItems = Array.isArray(includedItemsRaw) ? includedItemsRaw : [];
  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 py-10 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-start">
            <div className="space-y-6">
              <div className="relative w-full aspect-7/5 rounded-2xl overflow-hidden shadow-md bg-gray-50">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover object-top"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {product.gallery?.map((preview, index) => (
                  <div
                    key={`${preview}-${index}`}
                    className="relative aspect-video rounded-xl overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={preview}
                      alt={`${product.title} preview ${index + 1}`}
                      fill
                      sizes="320px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
                <InfoCard
                  icon={<Download className="h-5 w-5" />}
                  title={t("perks.instant")}
                  subtitle={t("perks.access")}
                />
                <InfoCard
                  icon={<ShieldCheck className="h-5 w-5" />}
                  title={t("perks.safe")}
                  subtitle={t("perks.checkout")}
                />
                <InfoCard
                  icon={<Star className="h-5 w-5" />}
                  title={t("perks.experience")}
                  subtitle={t("perks.rating")}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-wide text-black/50">
                  {t("collection")}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                  {product.title}
                </h1>
                <div className="flex items-center gap-3 text-black/60">
                  <span className="text-xl font-semibold">
                    {product.currency === "USD" ? "$" : product.currency}
                    {product.price}
                  </span>
                  <span>•</span>
                  <span className="text-sm bg-black text-white px-3 py-1 rounded-full">
                    {t("format")}
                  </span>
                </div>
                <p className="text-black/70 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FeatureBadge
                  icon={<Users className="h-4 w-4" />}
                  label={t("players")}
                  value={product.players}
                />
                <FeatureBadge
                  icon={<Clock className="h-4 w-4" />}
                  label={t("duration")}
                  value={product.duration}
                />
                <FeatureBadge
                  icon={<ShieldCheck className="h-4 w-4" />}
                  label={t("difficulty")}
                  value={product.difficulty}
                />
                <FeatureBadge
                  icon={<Star className="h-4 w-4" />}
                  label={t("rating.label")}
                  value={t("rating.value")}
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">{t("whatsIncluded.title")}</h3>
                <ul className="space-y-2 text-black/70">
                  {includedItems.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-black" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">{t("download.title")}</h3>
                <p className="text-black/70 leading-relaxed">
                  {t("download.description")}
                </p>
              </div>

              <CheckoutButton
                productId={product.id}
                label={t("cta")}
              />

              <p className="text-xs text-black/60">
                {t("guarantee")}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function InfoCard({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="p-4 rounded-xl border bg-white shadow-sm flex items-start gap-3">
      <div className="p-2 rounded-full bg-gray-100 text-black">{icon}</div>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-black/60">{subtitle}</p>
      </div>
    </div>
  );
}

function FeatureBadge({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border rounded-full text-sm">
      <span className="text-black/70">{icon}</span>
      <span className="font-medium">{label}:</span>
      <span className="text-black/70">{value}</span>
    </div>
  );
}
