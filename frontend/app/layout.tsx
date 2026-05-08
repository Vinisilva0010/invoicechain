import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SolanaWalletProvider } from "@/lib/wallet-provider";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InvoiceChain",
  description: "On-chain invoices for freelancers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <SolanaWalletProvider>{children}</SolanaWalletProvider>
      </body>
    </html>
  );
}
