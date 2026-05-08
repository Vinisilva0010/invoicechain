import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import bs58 from "bs58";
import idl from "./idl.json";

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);

export function getProgram() {
  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!, {
    commitment: "confirmed",
  });

  const privateKey = process.env.BACKEND_WALLET_PRIVATE_KEY!;
  const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
  const wallet = new Wallet(keypair);

  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  return new Program(idl as any, provider);
}

export function getInvoicePDA(
  freelancerPubkey: PublicKey,
  invoiceId: bigint
): [PublicKey, number] {
  const idBuffer = Buffer.alloc(8);
  idBuffer.writeBigUInt64LE(invoiceId);

  return PublicKey.findProgramAddressSync(
    [Buffer.from("invoice"), freelancerPubkey.toBuffer(), idBuffer],
    PROGRAM_ID
  );
}
