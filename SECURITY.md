# Seguridad de UrbanoSV

## Controles implementados

- Autenticación administrativa independiente del futuro acceso de clientes.
- Contraseñas con Argon2id.
- Token de acceso corto en cookie HttpOnly.
- Token de renovación aleatorio, rotado y almacenado como hash.
- Cookies Secure en producción y protección CSRF de doble envío.
- Control de roles en cada endpoint administrativo.
- Rate limiting general, de login y de creación de pedidos.
- Validación de entradas con Zod y consultas parametrizadas con Prisma.
- CORS con lista exacta de orígenes y encabezados con Helmet.
- Límites de solicitudes y archivos.
- Mensajes de autenticación genéricos.
- Registro de auditoría sin contraseñas ni tokens.
- Archivado lógico de productos y categorías.
- Precios y totales recalculados en el servidor.

## Requisitos antes de producción

1. Utilizar HTTPS para frontend y backend.
2. Generar `JWT_ACCESS_SECRET` mediante un generador criptográfico.
3. Reemplazar la contraseña inicial después del primer acceso.
4. Configurar `FRONTEND_ORIGIN` sin comodines.
5. Configurar copias de seguridad automáticas de PostgreSQL.
6. Configurar Cloudinary con credenciales restringidas.
7. Ejecutar auditorías de dependencias.
8. Habilitar monitoreo de errores y alertas de accesos.
9. Incorporar MFA para superadministradores antes de operar con información real.
10. Probar autorización, CSRF, XSS, inyección, carga de archivos y lógica comercial.

## Gestión de secretos

Nunca subas `DATABASE_URL`, `JWT_ACCESS_SECRET`, `SEED_ADMIN_PASSWORD` ni credenciales de Cloudinary. Guárdalos en el administrador de secretos del proveedor.
