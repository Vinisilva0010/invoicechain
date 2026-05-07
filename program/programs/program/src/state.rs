use anchor_lang::prelude::*;

#[account]
pub struct Invoice {
    pub freelancer: Pubkey,
    pub invoice_id: u64,
    pub amount_usd_cents: u64,
    pub description: String,
    pub status: InvoiceStatus,
    pub created_at: i64,
    pub expires_at: i64,
    pub paid_at: Option<i64>,
    pub kirapay_session_id: String,
}

impl Invoice {
    pub const LEN: usize = 8      // discriminator
        + 32                       // freelancer
        + 8                        // invoice_id
        + 8                        // amount_usd_cents
        + (4 + 200)                // description
        + 1                        // status
        + 8                        // created_at
        + 8                        // expires_at
        + 9                        // paid_at (Option<i64>)
        + (4 + 100);               // kirapay_session_id
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum InvoiceStatus {
    Pending,
    Paid,
    Expired,
}
