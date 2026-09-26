-- Add stable SKU prefixes to categories without changing existing variant SKUs.
ALTER TABLE "categories" ADD COLUMN "sku_prefix" VARCHAR(5);

UPDATE "categories" SET "sku_prefix" = 'TEC' WHERE "slug" = 'tecnologia';
UPDATE "categories" SET "sku_prefix" = 'MOD' WHERE "slug" = 'moda';
UPDATE "categories" SET "sku_prefix" = 'PER' WHERE "slug" = 'perfumes';
UPDATE "categories" SET "sku_prefix" = 'ACC' WHERE "slug" = 'accesorios';

WITH categories_without_prefix AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "created_at", "id") AS position
  FROM "categories"
  WHERE "sku_prefix" IS NULL
)
UPDATE "categories" AS category
SET "sku_prefix" = 'C' || LPAD(categories_without_prefix.position::TEXT, 4, '0')
FROM categories_without_prefix
WHERE category."id" = categories_without_prefix."id";

ALTER TABLE "categories" ALTER COLUMN "sku_prefix" SET NOT NULL;
CREATE UNIQUE INDEX "categories_sku_prefix_key" ON "categories"("sku_prefix");

-- Allocate a stable sequential number and SKU base to every existing product.
CREATE SEQUENCE "products_internal_number_seq" START WITH 1000 INCREMENT BY 1;

ALTER TABLE "products"
  ADD COLUMN "internal_number" INTEGER,
  ADD COLUMN "sku_base" VARCHAR(30);

ALTER TABLE "products"
  ALTER COLUMN "internal_number" SET DEFAULT nextval('"products_internal_number_seq"');

UPDATE "products"
SET "internal_number" = nextval('"products_internal_number_seq"')
WHERE "internal_number" IS NULL;

UPDATE "products" AS product
SET "sku_base" = category."sku_prefix" || '-' || LPAD(product."internal_number"::TEXT, 6, '0')
FROM "categories" AS category
WHERE category."id" = product."category_id";

SELECT setval(
  '"products_internal_number_seq"',
  COALESCE((SELECT MAX("internal_number") FROM "products"), 999),
  true
);

ALTER SEQUENCE "products_internal_number_seq" OWNED BY "products"."internal_number";
ALTER TABLE "products" ALTER COLUMN "internal_number" SET NOT NULL;
ALTER TABLE "products" ALTER COLUMN "sku_base" SET NOT NULL;

CREATE UNIQUE INDEX "products_internal_number_key" ON "products"("internal_number");
CREATE UNIQUE INDEX "products_sku_base_key" ON "products"("sku_base");