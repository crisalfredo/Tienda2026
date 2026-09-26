# UrbanoSV API

API REST para catálogo, administración, inventario, pedidos y configuración.

## Rutas públicas

```text
GET  /api/health
GET  /api/categories/public
GET  /api/products
GET  /api/products/:slug
POST /api/orders/public
GET  /api/store-settings
```

## Rutas administrativas

```text
GET    /api/admin/auth/csrf
POST   /api/admin/auth/login
POST   /api/admin/auth/refresh
GET    /api/admin/auth/me
POST   /api/admin/auth/logout
GET    /api/admin/dashboard
GET    /api/admin/products
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
GET    /api/categories/admin
POST   /api/categories/admin
PUT    /api/categories/admin/:id
DELETE /api/categories/admin/:id
GET    /api/admin/inventory
PATCH  /api/admin/inventory/:id
GET    /api/orders/admin
GET    /api/orders/admin/:id
PATCH  /api/orders/admin/:id/status
```

Las mutaciones administrativas requieren sesión, rol permitido, cookie CSRF y encabezado `X-CSRF-Token`.



UrbanoSV E Commerce

Proyecto completo de comercio electrónico con tienda pública, carrito, checkout por WhatsApp, panel administrativo y API segura.

Tecnologías

Frontend: React 19, TypeScript, Vite y Tailwind CSS 4.

Backend: Node.js 22, Express 5 y TypeScript.

Base de datos: PostgreSQL 17.

ORM y migraciones: Prisma.

Seguridad: cookies HttpOnly, tokens de acceso y renovación, CSRF, Argon2id, Helmet, CORS, rate limiting, validación Zod y auditoría.

Imágenes: integración opcional con Cloudinary.

Funcionalidades públicas

Home responsive, categorías y productos obtenidos desde la API.

Detalle de productos y variantes por talla, color o presentación.

Carrito persistente con limpieza inmediata después de crear el pedido.

Formulario de entrega y creación del pedido antes de abrir WhatsApp.

Validación de precios e inventario desde el backend.

Página de cuenta para clientes marcada como próxima función.

Funcionalidades administrativas

Login exclusivo para administradores.

Dashboard con métricas y pedidos recientes.

CRUD y archivado de productos y categorías.

Opciones, variantes, SKU, precios e inventario.

Gestión de pedidos, estados, descuento y reposición de inventario.

Configuración de tienda y WhatsApp.

Gestión de administradores por el superadministrador.

Registro de auditoría e integración opcional con Cloudinary.

Estructura

.
├── src/                         Frontend público y administrativo
│   ├── components/admin/
│   ├── components/layout/
│   ├── components/product/
│   ├── context/
│   ├── data/                    Datos de demostración
│   ├── pages/account/
│   ├── pages/admin/
│   ├── services/
│   └── types/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/
│       ├── lib/
│       ├── middleware/
│       ├── modules/
│       └── utils/
├── docker-compose.yml
└── package.json

Configuración local

1 Instalar dependencias

npm install
npm --prefix backend install

2 Preparar variables

Copia .env.example como .env y backend/.env.example como backend/.env.

En backend/.env sustituye obligatoriamente:

JWT_ACCESS_SECRET=una-cadena-aleatoria-de-al-menos-32-caracteres
SEED_ADMIN_EMAIL=tu-correo-administrativo
SEED_ADMIN_PASSWORD=una-contraseña-fuerte-de-al-menos-12-caracteres
WHATSAPP_NUMBER=503XXXXXXXX

Para habilitar la carga de imágenes desde el panel administrativo, copia las credenciales de Cloudinary Console → Settings → API Keys:

CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

Estas tres variables pertenecen exclusivamente al backend. En producción agrégalas al servicio de Render; no las configures en Vercel ni uses el API_SECRET en variables que comiencen con VITE_.

No subas ninguno de los archivos .env al repositorio.

3 Iniciar PostgreSQL

docker compose up -d postgres

También puedes utilizar PostgreSQL instalado localmente o un proveedor administrado y cambiar DATABASE_URL.

4 Crear tablas y datos iniciales

npm --prefix backend run prisma:deploy
npm --prefix backend run prisma:seed

El seed importa las cuatro categorías y los ocho productos de catalog.ts. También crea el primer superadministrador con las credenciales configuradas.

5 Ejecutar frontend y backend

npm run dev:all

Tienda: http://localhost:5173

API: http://localhost:4000/api

Salud de API: http://localhost:4000/api/health

Login administrativo: http://localhost:5173/admin/login

Modo de demostración

VITE_ENABLE_DEMO_DATA=true permite revisar la tienda pública si la API no está iniciada. No habilita el panel administrativo ni permite crear pedidos reales. En producción utiliza:

VITE_ENABLE_DEMO_DATA=false

Compilación

npm run build:all

El frontend genera dist/ y el backend backend/dist/.

Imágenes con Cloudinary

El formulario de productos y el de categorías permiten cargar archivos JPG, PNG y WebP de hasta 5 MB. El flujo es:

El administrador autenticado selecciona la imagen.

El frontend envía el archivo a POST /api/admin/uploads con la protección CSRF.

El backend valida el tipo y el tamaño, y realiza una carga firmada a Cloudinary.

Cloudinary limita la imagen a 2000 × 2000 píxeles y devuelve una URL HTTPS.

La URL se incorpora al formulario y se guarda al crear o actualizar el registro.

Los archivos se organizan en urbano-sv/products y urbano-sv/categories. La clave secreta nunca se expone en el frontend.

En producción ejecuta primero las migraciones:

npm --prefix backend run prisma:deploy
npm --prefix backend run start

Despliegue recomendado

Frontend: hosting de archivos estáticos.

Backend: servicio Node.js con HTTPS.

PostgreSQL: base de datos administrada con copias de seguridad.

Cloudinary: imágenes del catálogo.

Configura VITE_API_URL con la URL HTTPS de la API y FRONTEND_ORIGIN con el dominio exacto del frontend.

Flujo de pedidos

El frontend envía identificadores de variantes y cantidades.

El backend recupera precios vigentes y comprueba inventario.

Crea el pedido con estado AWAITING_CONFIRMATION.

Devuelve el enlace de WhatsApp.

El frontend limpia el carrito y abre WhatsApp.

Al confirmar el pedido se descuenta inventario.

Si se cancela antes de entregarlo se reponen las unidades.

Consulta SECURITY.md antes de desplegar. Ninguna configuración de ejemplo debe reutilizarse en producción.