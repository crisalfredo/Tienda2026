-- Allow product images to be associated with one option value (for example Color=Azul).
-- Existing images remain general because the new column is nullable.
ALTER TABLE "product_images"
  ADD COLUMN "option_value_id" UUID;

CREATE INDEX "product_images_option_value_id_idx"
  ON "product_images"("option_value_id");

ALTER TABLE "product_images"
  ADD CONSTRAINT "product_images_option_value_id_fkey"
  FOREIGN KEY ("option_value_id")
  REFERENCES "option_values"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;