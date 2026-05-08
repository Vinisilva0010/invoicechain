import { NextRequest, NextResponse } from "next/server";

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
    const amount = data.settlementAmount || null;

    console.log(`[webhook] payment confirmed`, {
      invoiceId,
      txHash,
      amount,
      sender: data.sender,
      recipient: data.recipient,
    });

    // Fase 4: aqui vai chamar mark_paid no contrato Anchor
  }

  if (event === "transaction.created") {
    console.log(`[webhook] transaction created`, { data });
  }

  if (event === "transaction.refund") {
    console.log(`[webhook] refund event`, { data });
  }

  return NextResponse.json({ received: true });
}
