import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CartProvider } from './context/CartContext'
import { CatalogProvider } from './context/CatalogContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CatalogProvider>
        <AdminAuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AdminAuthProvider>
      </CatalogProvider>
    </BrowserRouter>
  </StrictMode>,
)
