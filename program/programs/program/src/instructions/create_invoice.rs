use anchor_lang::prelude::*;
use crate::state::{Invoice, InvoiceStatus};
use crate::error::InvoiceError;

pub fn handler(
    ctx: Context<CreateInvoice>,
    invoice_id: u64,
    amount_usd_cents: u64,
    description: String,
    expires_at: i64,
) -> Result<()> {
    require!(amount_usd_cents > 0, InvoiceError::InvalidAmount);
    require!(description.len() <= 200, InvoiceError::DescriptionTooLong);
    let now = Clock::get()?.unix_timestamp;
    require!(expires_at > now, InvoiceError::InvalidExpiration);

    let invoice = &mut ctx.accounts.invoice;
    invoice.freelancer = ctx.accounts.freelancer.key();
    invoice.invoice_id = invoice_id;
    invoice.amount_usd_cents = amount_usd_cents;
    invoice.description = description;
    invoice.status = InvoiceStatus::Pending;
    invoice.created_at = now;
    invoice.expires_at = expires_at;
    invoice.paid_at = None;
    invoice.kirapay_session_id = String::new();

    Ok(())
}

#[derive(Accounts)]
#[instruction(invoice_id: u64)]
pub struct CreateInvoice<'info> {
    #[account(
        init,
        payer = freelancer,
        space = Invoice::LEN,
        seeds = [b"invoice", freelancer.key().as_ref(), &invoice_id.to_le_bytes()],
        bump
    )]
    pub invoice: Account<'info, Invoice>,
    #[account(mut)]
    pub freelancer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
