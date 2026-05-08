# InvoiceChain

On-chain invoice system for freelancers. Create a payment link, share with your client, get paid in USDC via KIRAPAY — payment confirmed on Solana.

## How it works

1. Freelancer connects Phantom wallet and creates an invoice
2. A payment link is generated via KIRAPAY
3. Client opens the link and pays with any token on any chain
4. KIRAPAY settles in USDC on Base and fires a webhook
5. Invoice status is updated on-chain via Anchor program on Solana

## Stack

- **Smart contract**: Rust + Anchor (Solana devnet)
- **Frontend**: Next.js 16 + TypeScript + Tailwind
- **Payments**: KIRAPAY cross-chain checkout
- **Wallet**: Phantom (Solana)

## Program ID (devnet)
4wy52jbYZop2pWWBtBmVZKUMFMrj86qrork9StcypSu7

## Run locally

```bash
# 1. Clone the repo
git clone https://github.com/Vinisilva0010/invoicechain.git
cd invoicechain

# 2. Deploy the Anchor program
cd program
anchor build
anchor deploy --provider.cluster devnet

# 3. Setup frontend
cd ../frontend
cp .env.local.example .env.local
# Fill in your KIRAPAY_API_KEY, BACKEND_WALLET_PRIVATE_KEY, and KIRAPAY_RECEIVER

npm install
npm run dev
```

## Environment variables

| Variable | Description |
|---|---|
| `KIRAPAY_API_KEY` | KIRAPAY merchant API key |
| `KIRAPAY_API_URL` | https://api.kira-pay.com |
| `KIRAPAY_RECEIVER` | EVM wallet address to receive payments |
| `NEXT_PUBLIC_SOLANA_RPC` | Solana RPC URL |
| `NEXT_PUBLIC_PROGRAM_ID` | Deployed Anchor program ID |
| `BACKEND_WALLET_PRIVATE_KEY` | Backend keypair for signing on-chain transactions |
| `WEBHOOK_SECRET` | Secret for validating KIRAPAY webhook calls |

## KIRAPAY integration

KIRAPAY handles cross-chain payment routing. The merchant creates a payment link via `POST /api/link/generate`, the client pays with any supported token, and KIRAPAY settles in USDC on Base. A webhook fires on `transaction.succeeded`, which triggers `mark_paid` on the Solana smart contract.
