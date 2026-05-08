"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface InvoiceData {
  invoiceId: string;
  status: string;
  description?: string;
  amountUsd?: number;
  checkoutUrl?: string;
  freelancerWallet?: string;
}

export default function InvoicePage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch("/api/invoices/" + id)
      .then((r) => r.json())
      .then((data) => {
        setInvoice(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading invoice...</p>
      </main>
    );
  }

  if (!invoice) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-red-400">Invoice not found.</p>
      </main>
    );
  }

  const isPaid = invoice.status === "paid";
  const isExpired = invoice.status === "expired";
  const checkoutUrl = invoice.checkoutUrl ?? "";
  const canPay = !isPaid && !isExpired && checkoutUrl.length > 0;

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-gray-900 rounded-xl p-8 space-y-6">

          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">InvoiceChain</h1>
            <span className={
              "text-xs px-3 py-1 rounded-full font-medium " +
              (isPaid ? "bg-green-900 text-green-400" :
               isExpired ? "bg-red-900 text-red-400" :
               "bg-yellow-900 text-yellow-400")
            }>
              {invoice.status}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-gray-400 text-sm">Service</p>
            <p className="text-white text-lg">{invoice.description || "no description"}</p>
          </div>

          <div className="space-y-2">
            <p className="text-gray-400 text-sm">Amount</p>
            <p className="text-white text-3xl font-bold">${invoice.amountUsd || "0"}</p>
          </div>

          {invoice.freelancerWallet && (
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">Freelancer</p>
              <p className="text-white font-mono text-sm">
                {invoice.freelancerWallet.slice(0, 6)}...{invoice.freelancerWallet.slice(-4)}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-gray-400 text-sm">Invoice ID</p>
            <p className="text-gray-300 font-mono text-xs">{invoice.invoiceId}</p>
          </div>

          {canPay && (
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="block w-full bg-blue-600 hover:bg-blue-700 text-center rounded-lg py-3 font-semibold transition-colors">
              Pay now
            </a>
          )}

          {isPaid && (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-center">
              <p className="text-green-400 font-semibold">Payment confirmed</p>
            </div>
          )}

          {isExpired && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-center">
              <p className="text-red-400 font-semibold">Invoice expired</p>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}