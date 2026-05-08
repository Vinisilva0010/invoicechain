import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Missing invoice id" }, { status: 400 });
  }

  // Fase 4: vai buscar do contrato Anchor on-chain
  return NextResponse.json({
    invoiceId: id,
    status: "pending",
  });
}
