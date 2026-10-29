-- Seguridad: activa Row Level Security (deny-by-default, sin políticas) en todas
-- las tablas de `public`. El backend se conecta como rol `postgres` (BYPASSRLS=true),
-- por lo que no se ve afectado; bloquea el acceso directo de anon/authenticated
-- a través de la Data API (PostgREST), que esta app no utiliza.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "refresh_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_options" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "option_values" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "variant_option_values" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "store_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- Rendimiento: índices de cobertura para FKs sin índice.
CREATE INDEX IF NOT EXISTS "order_items_variant_id_idx" ON "order_items" ("variant_id");
CREATE INDEX IF NOT EXISTS "variant_option_values_option_value_id_idx" ON "variant_option_values" ("option_value_id");
