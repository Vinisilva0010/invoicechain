import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import bs58 from "bs58";
import idl from "./idl.json";

const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID!);

class NodeWallet {
  constructor(readonly payer: Keypair) {}

  async signTransaction(tx: any) {
    tx.partialSign(this.payer);
    return tx;
  }

  async signAllTransactions(txs: any[]) {
    return txs.map((tx) => {
      tx.partialSign(this.payer);
      return tx;
    });
  }

  get publicKey() {
    return this.payer.publicKey;
  }
}

export function getProgram() {
  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!, {
    commitment: "confirmed",
  });

  const privateKey = process.env.BACKEND_WALLET_PRIVATE_KEY!;
  const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
  const wallet = new NodeWallet(keypair);

  const provider = new AnchorProvider(connection, wallet as any, {
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
