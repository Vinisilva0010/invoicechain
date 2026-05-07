use anchor_lang::prelude::*;
use crate::state::{Invoice, InvoiceStatus};
use crate::error::InvoiceError;

pub fn handler(ctx: Context<ExpireInvoice>) -> Result<()> {
    let invoice = &mut ctx.accounts.invoice;
    let now = Clock::get()?.unix_timestamp;

    require!(now > invoice.expires_at, InvoiceError::NotExpiredYet);
    require!(
        invoice.status == InvoiceStatus::Pending,
        InvoiceError::AlreadyProcessed
    );

    invoice.status = InvoiceStatus::Expired;

    Ok(())
}

#[derive(Accounts)]
pub struct ExpireInvoice<'info> {
    #[account(mut)]
    pub invoice: Account<'info, Invoice>,
}
