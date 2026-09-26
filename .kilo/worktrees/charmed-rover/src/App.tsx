import { Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/admin/AdminLayout'
import { AdminRoute } from './components/admin/AdminRoute'
import { Layout } from './components/layout/Layout'
import { CartPage } from './pages/CartPage'
import { CategoryPage } from './pages/CategoryPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProductDetailsPage } from './pages/ProductDetailsPage'
import { AccountUnavailablePage } from './pages/account/AccountUnavailablePage'
import { AdminAuditPage } from './pages/admin/AdminAuditPage'
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminOrderDetailsPage } from './pages/admin/AdminOrderDetailsPage'
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage'
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage'
import { AdminProductsPage } from './pages/admin/AdminProductsPage'
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/categoria/:slug" element={<CategoryPage />} />
        <Route path="/producto/:slug" element={<ProductDetailsPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/cuenta" element={<AccountUnavailablePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="productos" element={<AdminProductsPage />} />
          <Route path="productos/nuevo" element={<AdminProductFormPage />} />
          <Route path="productos/:id/editar" element={<AdminProductFormPage />} />
          <Route path="categorias" element={<AdminCategoriesPage />} />
          <Route path="inventario" element={<AdminInventoryPage />} />
          <Route path="pedidos" element={<AdminOrdersPage />} />
          <Route path="pedidos/:id" element={<AdminOrderDetailsPage />} />
          <Route path="configuracion" element={<AdminSettingsPage />} />
          <Route path="administradores" element={<AdminUsersPage />} />
          <Route path="auditoria" element={<AdminAuditPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
