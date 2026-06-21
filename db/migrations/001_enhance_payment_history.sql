-- MIGRATION: 001_enhance_payment_history.sql
-- PURPOSE: Add safe snapshot columns and enforce ledger uniqueness.

ALTER TABLE payment_history ADD COLUMN balance_due NUMERIC(10,2) NOT NULL DEFAULT 0.00;
ALTER TABLE payment_history ADD COLUMN receipt_status VARCHAR NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE payment_history ADD COLUMN remarks TEXT;

CREATE UNIQUE INDEX ix_payment_history_receipt_no ON payment_history(receipt_no);
CREATE INDEX ix_payment_history_receipt_status ON payment_history(receipt_status);
