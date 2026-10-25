-- Add an optional purchase/cost price per variant for profit reports and audits.
-- The column is nullable so existing variants keep working with no backfill;
-- it is admin-only data and is never exposed through the public product DTO.
ALTER TABLE "product_variants"
  ADD COLUMN "cost_price" DECIMAL(12, 2);
