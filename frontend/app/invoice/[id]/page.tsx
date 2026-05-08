"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

// StarField background component (same as home page)
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const stars: { x: number; y: number; r: number; twinkle: number }[] = [];
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.1,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
    let animId: number;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.fillStyle = "#000005";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.twinkle += 0.018;
        const alpha = 0.3 + 0.5 * Math.abs(Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 220, 255, ${alpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    }
    draw();
    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);
  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", top: 0, left: 0,
      width: "100vw", height: "100vh", zIndex: 0, pointerEvents: "none",
    }} />
  );
}

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
      <main className="min-h-screen bg-[#000005] text-[#f4f4f0] flex items-center justify-center font-mono">
        <p className="text-[#00eeff] text-xl uppercase tracking-widest animate-pulse">Loading receipt...</p>
      </main>
    );
  }

  if (!invoice) {
    return (
      <main className="min-h-screen bg-[#000005] text-[#f4f4f0] flex items-center justify-center font-mono">
        <div className="border-4 border-[#ff003c] p-6 shadow-[8px_8px_0px_#ff003c]">
          <p className="text-[#ff003c] font-bold text-xl uppercase tracking-widest">Error 404: Invoice not found</p>
        </div>
      </main>
    );
  }

  const isPaid = invoice.status === "paid";
  const isExpired = invoice.status === "expired";
  const checkoutUrl = invoice.checkoutUrl ?? "";
  const canPay = !isPaid && !isExpired && checkoutUrl.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #000005;
          color: #f4f4f0;
          font-family: 'Inter', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .root {
          position: relative;
          z-index: 1;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .receipt-container {
          background: rgba(0, 0, 10, 0.92);
          border: 4px solid #f4f4f0;
          box-shadow: 12px 12px 0px #00eeff;
          width: 100%;
          max-width: 440px;
          padding: 2.5rem 2rem;
          font-family: 'Space Mono', monospace;
          position: relative;
        }

        .receipt-container::before, .receipt-container::after {
          content: '========================================';
          display: block;
          overflow: hidden;
          white-space: nowrap;
          color: #f4f4f0;
          font-size: 0.9rem;
          line-height: 1;
          opacity: 0.5;
          margin-bottom: 1.5rem;
        }

        .receipt-container::after {
          margin-bottom: 0;
          margin-top: 1.5rem;
        }

        .receipt-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .receipt-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 3rem;
          letter-spacing: 0.1em;
          color: #00eeff;
          text-transform: uppercase;
          line-height: 1;
          -webkit-text-stroke: 1px #00eeff;
        }

        .receipt-subtitle {
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          color: rgba(244, 244, 240, 0.6);
          margin-top: 0.5rem;
        }

        .dashed-line {
          border-top: 2px dashed rgba(244, 244, 240, 0.3);
          margin: 1.25rem 0;
          width: 100%;
        }

        .receipt-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
          font-size: 0.85rem;
        }

        .row-label {
          color: rgba(244, 244, 240, 0.5);
          text-transform: uppercase;
        }

        .row-value {
          color: #f4f4f0;
          text-align: right;
          max-width: 60%;
          word-break: break-all;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 1.5rem;
        }

        .total-label {
          font-size: 1.2rem;
          font-weight: 700;
          color: #00eeff;
        }

        .total-value {
          font-size: 2.2rem;
          font-weight: 700;
          line-height: 1;
          color: #f4f4f0;
          text-shadow: 2px 2px 0px #7700ff;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border: 2px solid;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 0.5rem;
        }

        .status-pending { border-color: #f5a623; color: #f5a623; box-shadow: 3px 3px 0px #f5a623; }
        .status-paid { border-color: #00e676; color: #00e676; box-shadow: 3px 3px 0px #00e676; }
        .status-expired { border-color: #ff003c; color: #ff003c; box-shadow: 3px 3px 0px #ff003c; }

        .btn-pay {
          display: block;
          width: 100%;
          padding: 16px;
          background: #00eeff;
          border: 4px solid #000;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-align: center;
          color: #000;
          text-decoration: none;
          box-shadow: 6px 6px 0px #000;
          transition: transform 0.1s, box-shadow 0.1s;
          margin-top: 2rem;
        }

        .btn-pay:hover {
          transform: translate(-3px, -3px);
          box-shadow: 9px 9px 0px #7700ff;
        }

        .btn-pay:active {
          transform: translate(3px, 3px);
          box-shadow: 3px 3px 0px #000;
        }

        .notice-box {
          margin-top: 2rem;
          padding: 1rem;
          border: 3px solid;
          text-align: center;
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .notice-paid { border-color: #00e676; color: #00e676; background: rgba(0, 230, 118, 0.1); }
        .notice-expired { border-color: #ff003c; color: #ff003c; background: rgba(255, 0, 60, 0.1); }
      `}</style>

      <StarField />

      <main className="root">
        <div className="receipt-container">
          
          <div className="receipt-header">
            <div className="receipt-title">INVOICECHAIN</div>
            <div className="receipt-subtitle">ON-CHAIN PAYMENT RECEIPT</div>
            
            <div className={`status-badge ${
              isPaid ? 'status-paid' : isExpired ? 'status-expired' : 'status-pending'
            }`}>
              STATUS: {invoice.status}
            </div>
          </div>

          <div className="dashed-line"></div>

          <div className="receipt-row">
            <span className="row-label">TX ID</span>
            <span className="row-value">{invoice.invoiceId}</span>
          </div>

          {invoice.freelancerWallet && (
            <div className="receipt-row">
              <span className="row-label">MERCHANT</span>
              <span className="row-value">
                {invoice.freelancerWallet.slice(0, 8)}...{invoice.freelancerWallet.slice(-6)}
              </span>
            </div>
          )}

          <div className="dashed-line"></div>

          <div className="receipt-row">
            <span className="row-label">ITEM</span>
            <span className="row-label">AMOUNT</span>
          </div>

          <div className="receipt-row">
            <span className="row-value" style={{ textAlign: 'left' }}>
              {invoice.description || "NO DESCRIPTION PROVIDED"}
            </span>
            <span className="row-value">${invoice.amountUsd || "0.00"}</span>
          </div>

          <div className="dashed-line"></div>

          <div className="total-row">
            <span className="total-label">TOTAL DUE</span>
            <span className="total-value">${invoice.amountUsd || "0"}</span>
          </div>

          {canPay && (
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer" className="btn-pay">
              PAY NOW →
            </a>
          )}

          {isPaid && (
            <div className="notice-box notice-paid">
              ✓ PAYMENT CONFIRMED ON-CHAIN
            </div>
          )}

          {isExpired && (
            <div className="notice-box notice-expired">
              ✕ INVOICE HAS EXPIRED
            </div>
          )}

        </div>
      </main>
    </>
  );
}