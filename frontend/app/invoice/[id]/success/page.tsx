"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function SuccessPage() {
  const { id } = useParams();

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-gray-900 rounded-xl p-8 text-center space-y-6">
        <div className="text-5xl">✓</div>
        <h1 className="text-2xl font-bold text-green-400">Payment confirmed</h1>
        <p className="text-gray-400">
          The freelancer has been notified. The payment will be processed
          shortly.
        </p>
        <p className="text-gray-500 font-mono text-xs">Invoice #{id}</p>
        <Link
          href="/"
          className="block w-full bg-gray-800 hover:bg-gray-700 rounded-lg py-3 font-medium transition-colors"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
