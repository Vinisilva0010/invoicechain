"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface InvoiceForm {
  description: string;
  amountUsd: string;
  expiresAt: string;
}

interface CreatedInvoice {
  invoiceId: number;
  checkoutUrl: string;
  amountUsd: number;
  description: string;
}

export default function Home() {
  const { publicKey, connected } = useWallet();
  const [form, setForm] = useState<InvoiceForm>({
    description: "",
    amountUsd: "",
    expiresAt: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedInvoice | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleSubmit = async () => {
    if (!publicKey) return;
    setLoading(true);
    setError(null);
    setCreated(null);

    try {
      const expiresAt = form.expiresAt
        ? Math.floor(new Date(form.expiresAt).getTime() / 1000)
        : Math.floor(Date.now() / 1000) + 86400 * 7;

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          freelancerWallet: publicKey.toBase58(),
          amountUsdCents: Math.round(parseFloat(form.amountUsd) * 100),
          description: form.description,
          expiresAt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create invoice");
        return;
      }

      setCreated(data);
      setForm({ description: "", amountUsd: "", expiresAt: "" });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!created) return;
    const invoiceUrl = `${window.location.origin}/invoice/${created.invoiceId}`;
    navigator.clipboard.writeText(invoiceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold">InvoiceChain</h1>
          <WalletMultiButton />
        </div>

        {!connected && (
          <div className="text-center py-20 text-gray-400">
            Connect your Phantom wallet to create invoices.
          </div>
        )}

        {connected && (
          <div className="bg-gray-900 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">New Invoice</h2>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">
                Description
              </label>
              <input
                type="text"
                placeholder="Website development, logo design..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">
                Amount (USD)
              </label>
              <input
                type="number"
                placeholder="50.00"
                min="1"
                value={form.amountUsd}
                onChange={(e) =>
                  setForm({ ...form, amountUsd: e.target.value })
                }
                className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">
                Expires at (optional — default 7 days)
              </label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm({ ...form, expiresAt: e.target.value })
                }
                className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !form.description || !form.amountUsd}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg py-3 font-semibold transition-colors"
            >
              {loading ? "Creating..." : "Create Invoice"}
            </button>

            {created && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg space-y-3">
                <p className="text-green-400 font-semibold">Invoice created</p>
                <p className="text-sm text-gray-300">
                  {created.description} — ${created.amountUsd}
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={`${window.location.origin}/invoice/${created.invoiceId}`}
                    className="flex-1 bg-gray-700 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition-colors"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
