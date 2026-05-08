import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getProgram, getInvoicePDA } from "@/lib/anchor";
import { markInvoicePaid } from "@/lib/invoice-store";

export async function POST(req: NextRequest) {
  let body: any;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event, data } = body;

  if (!event || !data) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (event === "transaction.succeeded") {
    const invoiceId = data.customOrderId || null;
    const txHash = data.hash || null;

    console.log(`[webhook] payment confirmed`, {
      invoiceId,
      txHash,
      amount: data.settlementAmount,
      sender: data.sender,
      recipient: data.recipient,
    });

    if (invoiceId) {
      // Atualiza store em memória
      markInvoicePaid(invoiceId, txHash || "confirmed");

      // Atualiza on-chain
      try {
        const program = getProgram();
        const allInvoices = await (program.account as any).invoice.all();
        const match = allInvoices.find(
          (inv: any) => inv.account.invoiceId.toString() === invoiceId.toString()
        );

        if (!match) {
          console.error(`[webhook] invoice ${invoiceId} not found on-chain`);
          return NextResponse.json({ received: true });
        }

        const freelancerPubkey = new PublicKey(match.account.freelancer);
        const [invoicePDA] = getInvoicePDA(
          freelancerPubkey,
          BigInt(invoiceId)
        );

        await (program.methods as any)
          .markPaid(txHash || "kirapay_confirmed")
          .accounts({
            invoice: invoicePDA,
            freelancer: freelancerPubkey,
          })
          .rpc();

        console.log(`[webhook] invoice ${invoiceId} marked as paid on-chain`);
      } catch (err) {
        console.error(`[webhook] failed to mark on-chain:`, err);
      }
    }
  }

  if (event === "transaction.created") {
    console.log(`[webhook] transaction created`, { data });
  }

  if (event === "transaction.refund") {
    console.log(`[webhook] refund event`, { data });
  }

  return NextResponse.json({ received: true });
}
