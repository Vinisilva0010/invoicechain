use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

pub use instructions::*;

declare_id!("4wy52jbYZop2pWWBtBmVZKUMFMrj86qrork9StcypSu7");

#[program]
pub mod invoicechain {
    use super::*;

    pub fn create_invoice(
        ctx: Context<CreateInvoice>,
        invoice_id: u64,
        amount_usd_cents: u64,
        description: String,
        expires_at: i64,
    ) -> Result<()> {
        instructions::create_invoice::handler(ctx, invoice_id, amount_usd_cents, description, expires_at)
    }

    pub fn mark_paid(
        ctx: Context<MarkPaid>,
        kirapay_session_id: String,
    ) -> Result<()> {
        instructions::mark_paid::handler(ctx, kirapay_session_id)
    }

    pub fn expire_invoice(ctx: Context<ExpireInvoice>) -> Result<()> {
        instructions::expire_invoice::handler(ctx)
    }
}
