use anchor_lang::prelude::*;

#[error_code]
pub enum InvoiceError {
    #[msg("Invoice already paid or expired")]
    AlreadyProcessed,
    #[msg("Invoice has not expired yet")]
    NotExpiredYet,
    #[msg("Description too long (max 200 chars)")]
    DescriptionTooLong,
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Expiration must be in the future")]
    InvalidExpiration,
}
