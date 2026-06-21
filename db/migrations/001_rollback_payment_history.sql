-- ROLLBACK: 001_rollback_payment_history.sql
-- PURPOSE: Revert payment_history to its exact state prior to enhancement.
-- COMPATIBILITY: Requires SQLite >= 3.35.0 for DROP COLUMN support.

DROP INDEX IF EXISTS ix_payment_history_receipt_no;
DROP INDEX IF EXISTS ix_payment_history_receipt_status;

ALTER TABLE payment_history DROP COLUMN balance_due;
ALTER TABLE payment_history DROP COLUMN receipt_status;
ALTER TABLE payment_history DROP COLUMN remarks;
