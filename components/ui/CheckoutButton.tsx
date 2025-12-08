"use client";

import { useState } from "react";
import { Button } from "./button";
import { Alert, AlertDescription } from "./alert";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  productId: string | number;
  label: string;
}

export default function CheckoutButton({ productId, label }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Unable to start checkout");
      }

      window.location.href = payload.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-black text-white hover:bg-white hover:text-black border border-black"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {label}
          </span>
        ) : (
          label
        )}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
