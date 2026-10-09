import type { CartItem, DeliveryForm } from '../types'
import { formatCurrency } from './currency'

const configuredNumber = import.meta.env.VITE_WHATSAPP_NUMBER ?? ''

export function buildWhatsAppMessage(
  customer: DeliveryForm,
  items: CartItem[],
  total: number,
) {
  const productLines = items.map((item, index) => {
    const options = Object.entries(item.selectedOptions)
      .map(([name, value]) => `${name}: ${value}`)
      .join(', ')
    const detail = options ? ` (${options})` : ''

    return `${index + 1}. ${item.product.name}${detail}\n   ${item.quantity} × ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.unitPrice * item.quantity)}`
  })

  return [
    '🛍️ *NUEVO PEDIDO — URBANOSV*',
    '',
    '*Productos:*',
    ...productLines,
    '',
    `*Total estimado:* ${formatCurrency(total)}`,
    '',
    '*Datos de entrega:*',
    `Nombre: ${customer.name}`,
    `Teléfono: ${customer.phone}`,
    `Departamento: ${customer.department}`,
    `Municipio: ${customer.municipality}`,
    `Dirección: ${customer.address}`,
    `Referencia: ${customer.reference || 'No especificada'}`,
    `Forma de pago: ${customer.paymentMethod}`,
    `Notas: ${customer.notes || 'Sin notas adicionales'}`,
    '',
    'Por favor, confírmame la disponibilidad y el costo de entrega. Gracias.',
  ].join('\n')
}

export function buildWhatsAppHelpMessage(items: CartItem[]) {
  const productLines = items.map((item, index) => {
    const options = Object.entries(item.selectedOptions)
      .map(([name, value]) => `${name}: ${value}`)
      .join(', ')
    const detail = options ? ` (${options})` : ''

    return `${index + 1}. ${item.product.name}${detail} — Cantidad: ${item.quantity}`
  })

  return [
    'Hola, necesito ayuda para completar mi pedido en UrbanoSV.',
    '',
    'Productos en mi carrito:',
    ...productLines,
  ].join('\n')
}

export function createWhatsAppUrl(
  message: string,
  phoneNumber = '',
) {
  const phone = (phoneNumber || configuredNumber).replace(/\D/g, '')
  const destination = phone ? `https://wa.me/${phone}` : 'https://wa.me/'
  return `${destination}?text=${encodeURIComponent(message)}`
}


// import type { CartItem, DeliveryForm } from '../types'
// import { formatCurrency } from './currency'

// const configuredNumber = import.meta.env.VITE_WHATSAPP_NUMBER ?? ''

// export function buildWhatsAppMessage(
//   customer: DeliveryForm,
//   items: CartItem[],
//   total: number,
// ) {
//   const productLines = items.map((item, index) => {
//     const options = Object.entries(item.selectedOptions)
//       .map(([name, value]) => `${name}: ${value}`)
//       .join(', ')
//     const detail = options ? ` (${options})` : ''

//     return `${index + 1}. ${item.product.name}${detail}\n   ${item.quantity} × ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.unitPrice * item.quantity)}`
//   })

//   return [
//     '🛍️ *NUEVO PEDIDO — URBANOSV*',
//     '',
//     '*Productos:*',
//     ...productLines,
//     '',
//     `*Total estimado:* ${formatCurrency(total)}`,
//     '',
//     '*Datos de entrega:*',
//     `Nombre: ${customer.name}`,
//     `Teléfono: ${customer.phone}`,
//     `Departamento: ${customer.department}`,
//     `Municipio: ${customer.municipality}`,
//     `Dirección: ${customer.address}`,
//     `Referencia: ${customer.reference || 'No especificada'}`,
//     `Forma de pago: ${customer.paymentMethod}`,
//     `Notas: ${customer.notes || 'Sin notas adicionales'}`,
//     '',
//     'Por favor, confírmame la disponibilidad y el costo de entrega. Gracias.',
//   ].join('\n')
// }

// export function createWhatsAppUrl(message: string) {
//   const phone = configuredNumber.replace(/\D/g, '')
//   const destination = phone ? `https://wa.me/${phone}` : 'https://wa.me/'
//   return `${destination}?text=${encodeURIComponent(message)}`
// }
