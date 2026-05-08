"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

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

interface InvoiceForm { description: string; amountUsd: string; expiresAt: string; }
interface CreatedInvoice { invoiceId: number; checkoutUrl: string; amountUsd: number; description: string; }

export default function Home() {
  const { publicKey, connected } = useWallet();
  const [form, setForm] = useState<InvoiceForm>({ description: "", amountUsd: "", expiresAt: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedInvoice | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleSubmit = async () => {
    if (!publicKey) return;
    setLoading(true); setError(null); setCreated(null);
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
      if (!res.ok) { setError(data.error || "Failed to create invoice"); return; }
      setCreated(data);
      setForm({ description: "", amountUsd: "", expiresAt: "" });
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  };

  const handleCopy = () => {
    if (!created) return;
    navigator.clipboard.writeText(`${window.location.origin}/invoice/${created.invoiceId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          flex-direction: column;
        }

        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          border-bottom: 4px solid #00eeff;
          background: rgba(0,0,5,0.85);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          letter-spacing: 0.08em;
          color: #f4f4f0;
          line-height: 1;
          -webkit-text-stroke: 1px #00eeff;
          text-shadow: 4px 4px 0px #00eeff;
          text-transform: uppercase;
        }

        .nav-tag {
          font-family: 'Space Mono', monospace;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #7700ff;
          border: 2px solid #7700ff;
          padding: 4px 10px;
          margin-left: 12px;
          vertical-align: middle;
          box-shadow: 3px 3px 0px #7700ff;
        }

        .content-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4rem;
          max-width: 1300px;
          margin: 0 auto;
          padding: 4rem 2rem;
          width: 100%;
          flex: 1;
          align-items: center;
        }

        @media (min-width: 1024px) {
          .content-wrapper {
            flex-direction: row;
            align-items: flex-start;
            justify-content: space-between;
            padding: 6rem 2rem;
          }
        }

        .hero {
          flex: 1;
          max-width: 600px;
          width: 100%;
        }

        .hero-eyebrow {
          font-family: 'Space Mono', monospace;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #00eeff;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .hero-eyebrow::before {
          content: '';
          display: inline-block;
          width: 32px;
          height: 3px;
          background: #00eeff;
          box-shadow: 0 0 8px #00eeff;
        }

        .hero-h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4rem, 8vw, 8rem);
          line-height: 0.88;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .hero-h1 .stroke {
          -webkit-text-stroke: 3px #00eeff;
          color: transparent;
          display: block;
        }

        .hero-h1 .filled {
          color: #f4f4f0;
          display: block;
          text-shadow: 6px 6px 0px #7700ff;
        }

        .hero-desc {
          font-size: 1rem;
          color: rgba(244,244,240,0.5);
          line-height: 1.7;
          max-width: 460px;
          margin: 1.75rem 0 2.5rem;
        }

        .hero-desc strong { color: #00eeff; font-weight: 600; }

        .pull-quote {
          display: inline-block;
          background: #00eeff;
          color: #000005;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(1.4rem, 4vw, 2.2rem);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 10px 20px;
          border: 4px solid #000;
          box-shadow: 6px 6px 0px #000;
          transform: rotate(-1deg);
          margin-bottom: 3rem;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border: 4px solid #f4f4f0;
          box-shadow: 8px 8px 0px #00eeff;
          max-width: 560px;
        }

        .stat {
          padding: 1.25rem 1rem;
          border-right: 4px solid #f4f4f0;
          text-align: center;
        }

        .stat:last-child { border-right: none; }

        .stat-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.2rem;
          line-height: 1;
          color: #00eeff;
          text-shadow: 3px 3px 0px #7700ff;
          display: block;
        }

        .stat-label {
          font-family: 'Space Mono', monospace;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(244,244,240,0.4);
          margin-top: 4px;
          display: block;
        }

        .card-wrap {
          width: 100%;
          max-width: 520px;
          flex: 0 0 auto;
        }

        .card-header {
          background: #00eeff;
          border: 4px solid #000;
          border-bottom: none;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 8px -4px 0px #7700ff;
        }

        .card-header-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.5rem;
          letter-spacing: 0.1em;
          color: #000;
          text-transform: uppercase;
        }

        .card-header-tag {
          font-family: 'Space Mono', monospace;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #000;
          opacity: 0.6;
        }

        .card {
          background: rgba(0,0,10,0.92);
          border: 4px solid #f4f4f0;
          border-top: none;
          padding: 2rem 1.75rem;
          box-shadow: 8px 8px 0px #7700ff;
        }

        .connect-prompt { text-align: center; padding: 2rem 0; }

        .connect-big {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.5rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #f4f4f0;
          -webkit-text-stroke: 1px #7700ff;
          margin-bottom: 0.75rem;
          line-height: 1;
        }

        .connect-sub {
          font-family: 'Space Mono', monospace;
          font-size: 0.75rem;
          color: rgba(244,244,240,0.4);
          letter-spacing: 0.1em;
          margin-bottom: 1.75rem;
        }

        .field { margin-bottom: 1.25rem; }

        .field label {
          display: block;
          font-family: 'Space Mono', monospace;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #00eeff;
          margin-bottom: 0.4rem;
        }

        .field input {
          width: 100%;
          background: #000005;
          border: 3px solid #f4f4f0;
          padding: 11px 14px;
          font-family: 'Space Mono', monospace;
          font-size: 0.9rem;
          color: #f4f4f0;
          outline: none;
          border-radius: 0;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-shadow: 4px 4px 0px rgba(0,0,0,0.8);
        }

        .field input::placeholder { color: rgba(244,244,240,0.2); }

        .field input:focus {
          border-color: #00eeff;
          box-shadow: 4px 4px 0px #00eeff;
        }

        .btn-primary {
          width: 100%;
          padding: 15px;
          background: #00eeff;
          border: 4px solid #000;
          border-radius: 0;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.35rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #000;
          cursor: pointer;
          box-shadow: 6px 6px 0px #000;
          transition: transform 0.1s, box-shadow 0.1s;
          margin-top: 0.5rem;
          display: block;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translate(-3px, -3px);
          box-shadow: 9px 9px 0px #7700ff;
        }

        .btn-primary:active:not(:disabled) {
          transform: translate(3px, 3px);
          box-shadow: 3px 3px 0px #000;
        }

        .btn-primary:disabled {
          background: #222;
          color: #444;
          cursor: not-allowed;
          box-shadow: none;
        }

        .error-msg {
          font-family: 'Space Mono', monospace;
          font-size: 0.75rem;
          color: #ff003c;
          border: 3px solid #ff003c;
          padding: 10px 12px;
          margin-top: 0.75rem;
          box-shadow: 4px 4px 0px #ff003c;
        }

        .success-box {
          margin-top: 1.5rem;
          border: 4px solid #00eeff;
          padding: 1.25rem;
          box-shadow: 6px 6px 0px #7700ff;
          position: relative;
        }

        .success-tag {
          position: absolute;
          top: -14px;
          left: 16px;
          background: #00eeff;
          color: #000;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.95rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 2px 10px;
          border: 2px solid #000;
        }

        .success-invoice-name {
          font-family: 'Space Mono', monospace;
          font-size: 0.8rem;
          color: rgba(244,244,240,0.5);
          margin-bottom: 0.85rem;
          margin-top: 0.5rem;
        }

        .copy-row { display: flex; }

        .copy-input {
          flex: 1;
          background: #000005 !important;
          border: 3px solid #f4f4f0 !important;
          border-right: none !important;
          border-radius: 0 !important;
          padding: 9px 12px !important;
          font-family: 'Space Mono', monospace !important;
          font-size: 0.72rem !important;
          color: rgba(244,244,240,0.6) !important;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .btn-copy {
          padding: 9px 18px;
          background: #7700ff;
          border: 3px solid #f4f4f0;
          color: #f4f4f0;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          white-space: nowrap;
          box-shadow: 4px 4px 0px #000;
          transition: background 0.15s, transform 0.1s, box-shadow 0.1s;
        }

        .btn-copy:hover {
          background: #00eeff;
          color: #000;
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px #000;
        }

        .wallet-adapter-button {
          font-family: 'Space Mono', monospace !important;
          font-size: 0.72rem !important;
          font-weight: 700 !important;
          letter-spacing: 0.1em !important;
          text-transform: uppercase !important;
          background: transparent !important;
          border: 3px solid #f4f4f0 !important;
          border-radius: 0 !important;
          color: #f4f4f0 !important;
          padding: 8px 16px !important;
          box-shadow: 4px 4px 0px #00eeff !important;
          transition: transform 0.1s, box-shadow 0.1s !important;
        }

        .wallet-adapter-button:hover {
          transform: translate(-2px, -2px) !important;
          box-shadow: 6px 6px 0px #00eeff !important;
          background: rgba(0,238,255,0.06) !important;
        }

        .wallet-adapter-button-start-icon { display: none !important; }
      `}</style>

      <StarField />

      <div className="root">
        <nav className="nav">
          <div>
            <span className="logo">InvoiceChain</span>
            <span className="nav-tag">on-chain</span>
          </div>
          <WalletMultiButton />
        </nav>

        <div className="content-wrapper">
          
          <div className="hero">
            <div className="hero-eyebrow">
              Solana + KIRAPAY cross-chain
            </div>

            <h1 className="hero-h1">
              <span className="stroke">INVOICES</span>
              <span className="filled">FOR THE</span>
              <span className="stroke">CHAIN</span>
            </h1>

            <p className="hero-desc">
              Create an invoice, send the link to your client, and get paid in{" "}
              <strong>any token on any network</strong> — with permanent settlement on Solana.
            </p>

            <div className="pull-quote">
              Zero KYC. Zero Banks. 100% on-chain.
            </div>

            <div className="stats">
              <div className="stat">
                <span className="stat-num">700+</span>
                <span className="stat-label">Supported wallets</span>
              </div>
              <div className="stat">
                <span className="stat-num">10+</span>
                <span className="stat-label">Supported chains</span>
              </div>
              <div className="stat">
                <span className="stat-num">∞</span>
                <span className="stat-label">On-chain proof</span>
              </div>
            </div>
          </div>

          <div className="card-wrap">
            <div className="card-header">
              <span className="card-header-title">New Invoice</span>
              <span className="card-header-tag">Powered by KIRAPAY</span>
            </div>

            <div className="card">
              {!connected ? (
                <div className="connect-prompt">
                  <div className="connect-big">Connect your<br />Phantom wallet</div>
                  <div className="connect-sub">// to start creating invoices</div>
                  <WalletMultiButton />
                </div>
              ) : (
                <>
                  <div className="field">
                    <label>Description</label>
                    <input
                      type="text"
                      placeholder="website development, logo design..."
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Amount (USD)</label>
                    <input
                      type="number"
                      placeholder="50.00"
                      min="1"
                      value={form.amountUsd}
                      onChange={(e) => setForm({ ...form, amountUsd: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Expires at — optional (default 7 days)</label>
                    <input
                      type="datetime-local"
                      value={form.expiresAt}
                      onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    />
                  </div>

                  {error && <div className="error-msg">// error: {error}</div>}

                  <button
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={loading || !form.description || !form.amountUsd}
                  >
                    {loading ? "Creating..." : "Create Invoice →"}
                  </button>

                  {created && (
                    <div className="success-box">
                      <div className="success-tag">Invoice created</div>
                      <div className="success-invoice-name">
                        {created.description} — ${created.amountUsd}
                      </div>
                      <div className="copy-row">
                        <input
                          readOnly
                          className="copy-input"
                          value={`${window.location.origin}/invoice/${created.invoiceId}`}
                        />
                        <button className="btn-copy" onClick={handleCopy}>
                          {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}