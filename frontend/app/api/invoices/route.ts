import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { freelancerWallet, amountUsdCents, description, expiresAt } =
    await req.json();

  if (!freelancerWallet || !amountUsdCents || !description) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (amountUsdCents <= 0) {
    return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
  }

  const invoiceId = Date.now();
  const amountUsd = amountUsdCents / 100;

  const kirapayRes = await fetch(
    `${process.env.KIRAPAY_API_URL}/api/link/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.KIRAPAY_API_KEY!,
      },
      body: JSON.stringify({
        tokenOut: {
          chainId: "8453", // Base
          address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC na Base
        },
        receiver: process.env.KIRAPAY_RECEIVER,
        originalPrice: amountUsd,
        fiatCurrency: "USD",
        name: description,
        customOrderId: invoiceId.toString(),
        redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/invoice/${invoiceId}/success`,
        type: "single_use",
        isViewAsCrypto: false,
      }),
    }
  );

  if (!kirapayRes.ok) {
    const err = await kirapayRes.text();
    return NextResponse.json(
      { error: "KIRAPAY error", detail: err },
      { status: 502 }
    );
  }

  const kirapayData = await kirapayRes.json();
  const checkoutUrl = kirapayData.data?.url;

  if (!checkoutUrl) {
    return NextResponse.json(
      { error: "No checkout URL returned by KIRAPAY" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    invoiceId,
    checkoutUrl,
    amountUsd,
    description,
    freelancerWallet,
    expiresAt,
  });
}
