import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import BN from "bn.js";
import { assert } from "chai";

describe("invoicechain", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Invoicechain as Program<any>;
  const freelancer = provider.wallet;

  it("creates an invoice", async () => {
    const invoiceId = new BN(Date.now());
    const amountUsdCents = new BN(5000);
    const description = "Website development";
    const expiresAt = new BN(Math.floor(Date.now() / 1000) + 86400);

    const [invoicePDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("invoice"),
        freelancer.publicKey.toBuffer(),
        invoiceId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    await program.methods
      .createInvoice(invoiceId, amountUsdCents, description, expiresAt)
      .accounts({
        invoice: invoicePDA,
        freelancer: freelancer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const invoice = await program.account.invoice.fetch(invoicePDA);
    assert.equal(invoice.amountUsdCents.toString(), "5000");
    assert.equal(invoice.description, "Website development");
    assert.deepEqual(invoice.status, { pending: {} });
  });

  it("marks invoice as paid", async () => {
    const invoiceId = new BN(Date.now());
    const amountUsdCents = new BN(10000);
    const description = "Logo design";
    const expiresAt = new BN(Math.floor(Date.now() / 1000) + 86400);

    const [invoicePDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("invoice"),
        freelancer.publicKey.toBuffer(),
        invoiceId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    await program.methods
      .createInvoice(invoiceId, amountUsdCents, description, expiresAt)
      .accounts({
        invoice: invoicePDA,
        freelancer: freelancer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .markPaid("session_test_123")
      .accounts({
        invoice: invoicePDA,
        freelancer: freelancer.publicKey,
      })
      .rpc();

    const invoice = await program.account.invoice.fetch(invoicePDA);
    assert.deepEqual(invoice.status, { paid: {} });
    assert.equal(invoice.kirapaySessionId, "session_test_123");
  });
});
