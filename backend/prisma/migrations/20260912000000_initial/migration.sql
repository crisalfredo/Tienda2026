CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'ADMIN', 'CUSTOMER');
CREATE TYPE "OrderStatus" AS ENUM ('AWAITING_CONFIRMATION', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

CREATE TABLE "users" (
  "id" UUID NOT NULL, "name" VARCHAR(100) NOT NULL, "email" VARCHAR(190) NOT NULL,
  "password_hash" TEXT NOT NULL, "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
  "is_active" BOOLEAN NOT NULL DEFAULT true, "last_login_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "refresh_sessions" (
  "id" UUID NOT NULL, "user_id" UUID NOT NULL, "token_hash" CHAR(64) NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL, "user_agent" VARCHAR(500), "ip_address" VARCHAR(64),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "refresh_sessions_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "categories" (
  "id" UUID NOT NULL, "name" VARCHAR(80) NOT NULL, "slug" VARCHAR(100) NOT NULL,
  "description" VARCHAR(300) NOT NULL, "image_url" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true, "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "products" (
  "id" UUID NOT NULL, "category_id" UUID NOT NULL, "name" VARCHAR(140) NOT NULL,
  "slug" VARCHAR(170) NOT NULL, "short_description" VARCHAR(260) NOT NULL,
  "description" TEXT NOT NULL, "badge" VARCHAR(40), "featured" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL, CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "product_images" (
  "id" UUID NOT NULL, "product_id" UUID NOT NULL, "url" TEXT NOT NULL,
  "alt_text" VARCHAR(180), "sort_order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "product_options" (
  "id" UUID NOT NULL, "product_id" UUID NOT NULL, "name" VARCHAR(60) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "product_options_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "option_values" (
  "id" UUID NOT NULL, "option_id" UUID NOT NULL, "value" VARCHAR(80) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0, CONSTRAINT "option_values_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "product_variants" (
  "id" UUID NOT NULL, "product_id" UUID NOT NULL, "sku" VARCHAR(80) NOT NULL,
  "price" DECIMAL(12,2) NOT NULL, "previous_price" DECIMAL(12,2), "stock" INTEGER NOT NULL DEFAULT 0,
  "is_default" BOOLEAN NOT NULL DEFAULT false, "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "variant_option_values" (
  "variant_id" UUID NOT NULL, "option_value_id" UUID NOT NULL,
  CONSTRAINT "variant_option_values_pkey" PRIMARY KEY ("variant_id", "option_value_id")
);
CREATE TABLE "orders" (
  "id" UUID NOT NULL, "order_number" VARCHAR(24) NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'AWAITING_CONFIRMATION',
  "customer_name" VARCHAR(120) NOT NULL, "customer_phone" VARCHAR(30) NOT NULL,
  "department" VARCHAR(80) NOT NULL, "municipality" VARCHAR(100) NOT NULL,
  "address" VARCHAR(300) NOT NULL, "reference" VARCHAR(240),
  "payment_method" VARCHAR(80) NOT NULL, "notes" VARCHAR(500), "admin_notes" VARCHAR(1000),
  "subtotal" DECIMAL(12,2) NOT NULL, "delivery_fee" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(12,2) NOT NULL, "inventory_committed" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "order_items" (
  "id" UUID NOT NULL, "order_id" UUID NOT NULL, "variant_id" UUID,
  "product_name" VARCHAR(140) NOT NULL, "product_slug" VARCHAR(170) NOT NULL,
  "variant_label" VARCHAR(240), "sku" VARCHAR(80) NOT NULL, "unit_price" DECIMAL(12,2) NOT NULL,
  "quantity" INTEGER NOT NULL, "line_total" DECIMAL(12,2) NOT NULL,
  CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "store_settings" (
  "id" INTEGER NOT NULL DEFAULT 1, "store_name" VARCHAR(100) NOT NULL DEFAULT 'UrbanoSV',
  "whatsapp_number" VARCHAR(30) NOT NULL, "support_message" VARCHAR(180) NOT NULL DEFAULT 'Atención por WhatsApp',
  "delivery_message" VARCHAR(180) NOT NULL DEFAULT 'Entregas disponibles en El Salvador',
  "updated_at" TIMESTAMP(3) NOT NULL, CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "audit_logs" (
  "id" UUID NOT NULL, "actor_id" UUID, "action" VARCHAR(80) NOT NULL,
  "entity_type" VARCHAR(80) NOT NULL, "entity_id" VARCHAR(100), "before_data" JSONB,
  "after_data" JSONB, "ip_address" VARCHAR(64), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "refresh_sessions_token_hash_key" ON "refresh_sessions"("token_hash");
CREATE INDEX "refresh_sessions_user_id_idx" ON "refresh_sessions"("user_id");
CREATE INDEX "refresh_sessions_expires_at_idx" ON "refresh_sessions"("expires_at");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE INDEX "categories_is_active_sort_order_idx" ON "categories"("is_active", "sort_order");
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE INDEX "products_category_id_is_active_idx" ON "products"("category_id", "is_active");
CREATE INDEX "products_featured_is_active_idx" ON "products"("featured", "is_active");
CREATE INDEX "product_images_product_id_sort_order_idx" ON "product_images"("product_id", "sort_order");
CREATE UNIQUE INDEX "product_options_product_id_name_key" ON "product_options"("product_id", "name");
CREATE UNIQUE INDEX "option_values_option_id_value_key" ON "option_values"("option_id", "value");
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");
CREATE INDEX "product_variants_product_id_is_active_idx" ON "product_variants"("product_id", "is_active");
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at");
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "option_values" ADD CONSTRAINT "option_values_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "product_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "variant_option_values" ADD CONSTRAINT "variant_option_values_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "variant_option_values" ADD CONSTRAINT "variant_option_values_option_value_id_fkey" FOREIGN KEY ("option_value_id") REFERENCES "option_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
