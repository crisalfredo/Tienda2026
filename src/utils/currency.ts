export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
