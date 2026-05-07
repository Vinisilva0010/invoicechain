use anchor_lang::prelude::*;
use crate::state::{Invoice, InvoiceStatus};
use crate::error::InvoiceError;

pub fn handler(
    ctx: Context<MarkPaid>,
    kirapay_session_id: String,
) -> Result<()> {
    let invoice = &mut ctx.accounts.invoice;
    require!(
        invoice.status == InvoiceStatus::Pending,
        InvoiceError::AlreadyProcessed
    );

    invoice.status = InvoiceStatus::Paid;
    invoice.paid_at = Some(Clock::get()?.unix_timestamp);
    invoice.kirapay_session_id = kirapay_session_id;

    Ok(())
}

#[derive(Accounts)]
pub struct MarkPaid<'info> {
    #[account(mut, has_one = freelancer)]
    pub invoice: Account<'info, Invoice>,
    pub freelancer: Signer<'info>,
}
