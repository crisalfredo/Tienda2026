import { Coins, Info, PackageCheck, TrendingUp, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AdminPageHeader, Panel } from '../../components/admin/AdminUi'
import { adminApi } from '../../services/api'
import { formatCurrency } from '../../utils/currency'

interface ProfitSummary {
  activeProducts: number
  variantsWithCost: number
  variantsMissingCost: number
  inventoryRetailValue: number
  inventoryCostValue: number
  potentialProfit: number
  potentialMargin: number | null
  realizedRevenue: number
  realizedEstimatedCost: number
  realizedEstimatedProfit: number
  realizedMargin: number | null
  realizedItemsMissingCost: number
}

interface ProfitRow {
  id: string
  name: string
  categorySlug: string
  price: number
  costPrice: number | null
  unitProfit: number | null
  margin: number | null
  stock: number
  potentialProfit: number
  hasMissingCost: boolean
}

interface ReportData {
  summary: ProfitSummary
  products: ProfitRow[]
}

const percent = (value: number | null) => (value != null ? `${(value * 100).toFixed(1)}%` : '—')

export function AdminReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminApi
      .get<{ data: ReportData }>('/admin/reports/profit')
      .then((result) => setData(result.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudo cargar el reporte.'))
  }, [])

  // Orden por ganancia potencial: lo que más aporta primero.
  const rows = useMemo(
    () => (data ? [...data.products].sort((a, b) => b.potentialProfit - a.potentialProfit) : []),
    [data],
  )

  const summary = data?.summary

  const cards = summary
    ? ([
        ['Ganancia potencial', formatCurrency(summary.potentialProfit), 'Si vendes todo el stock con costo cargado', TrendingUp, 'text-emerald-700 bg-emerald-100'],
        ['Margen potencial', percent(summary.potentialMargin), 'Sobre el inventario con costo cargado', Coins, 'text-violet-700 bg-violet-100'],
        ['Inventario a precio', formatCurrency(summary.inventoryRetailValue), 'Valor de venta del stock activo', Wallet, 'text-blue-700 bg-blue-100'],
        ['Inventario a costo', formatCurrency(summary.inventoryCostValue), 'Inversión en stock con costo cargado', PackageCheck, 'text-amber-700 bg-amber-100'],
      ] as const)
    : []

  return (
    <>
      <AdminPageHeader
        eyebrow="FINANZAS"
        title="Reporte de ganancias"
        description="Ganancia potencial de tu inventario y ganancia estimada de las ventas confirmadas."
      />

      {error && <p className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {!data && !error && <p className="py-10 text-center text-zinc-400">Cargando reporte...</p>}

      {summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(([label, value, hint, Icon, style]) => (
              <Panel key={label}>
                <span className={`grid size-11 place-items-center rounded-xl ${style}`}>
                  <Icon size={21} />
                </span>
                <p className="mt-5 text-sm font-semibold text-zinc-500">{label}</p>
                <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>
                <p className="mt-2 text-xs leading-5 text-zinc-400">{hint}</p>
              </Panel>
            ))}
          </div>

          {summary.variantsMissingCost > 0 && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <Info size={18} className="mt-0.5 shrink-0" />
              <p>
                {summary.variantsMissingCost} {summary.variantsMissingCost === 1 ? 'variante activa no tiene' : 'variantes activas no tienen'} costo de compra cargado, por lo que no{' '}
                {summary.variantsMissingCost === 1 ? 'entra' : 'entran'} en estos cálculos. Agrégalo al editar el producto.
              </p>
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-zinc-950 p-6 text-white sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-xl font-extrabold">Ventas confirmadas</h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-zinc-300">Estimado</span>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-sm text-zinc-400">Ingresos</p>
                <p className="mt-1 font-display text-2xl font-extrabold">{formatCurrency(summary.realizedRevenue)}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Costo estimado</p>
                <p className="mt-1 font-display text-2xl font-extrabold">{formatCurrency(summary.realizedEstimatedCost)}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-400">Ganancia estimada</p>
                <p className="mt-1 font-display text-2xl font-extrabold text-emerald-400">
                  {formatCurrency(summary.realizedEstimatedProfit)}
                </p>
                <p className="mt-1 text-xs text-zinc-400">Margen {percent(summary.realizedMargin)}</p>
              </div>
            </div>
            <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-zinc-400">
              <Info size={15} className="mt-0.5 shrink-0" />
              Estimación: el pedido no guarda el costo del momento de la venta, así que se usa el costo actual de cada variante.
              {summary.realizedItemsMissingCost > 0 &&
                ` ${summary.realizedItemsMissingCost} ${summary.realizedItemsMissingCost === 1 ? 'línea vendida no tiene' : 'líneas vendidas no tienen'} costo y se excluyen de la ganancia.`}
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-zinc-950 text-xs uppercase tracking-wide text-zinc-300">
                  <tr>
                    <th className="px-5 py-4">Producto</th>
                    <th className="px-5 py-4">Categoría</th>
                    <th className="px-5 py-4 text-right">Precio</th>
                    <th className="px-5 py-4 text-right">Costo</th>
                    <th className="px-5 py-4 text-right">Ganancia unit.</th>
                    <th className="px-5 py-4 text-right">Margen</th>
                    <th className="px-5 py-4 text-right">Stock</th>
                    <th className="px-5 py-4 text-right">Ganancia potencial</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const negative = row.unitProfit != null && row.unitProfit < 0
                    const profitClass = row.unitProfit == null ? 'text-zinc-400' : negative ? 'text-red-600' : 'text-emerald-700'
                    return (
                      <tr key={row.id} className="border-b border-zinc-100">
                        <td className="px-5 py-4">
                          <p className="font-bold">{row.name}</p>
                          {row.hasMissingCost && <p className="text-xs font-semibold text-amber-600">Falta costo en alguna variante</p>}
                        </td>
                        <td className="px-5 py-4 capitalize">{row.categorySlug}</td>
                        <td className="px-5 py-4 text-right font-bold">{formatCurrency(row.price)}</td>
                        <td className="px-5 py-4 text-right">{row.costPrice != null ? formatCurrency(row.costPrice) : '—'}</td>
                        <td className={`px-5 py-4 text-right font-bold ${profitClass}`}>
                          {row.unitProfit != null ? formatCurrency(row.unitProfit) : 'Sin costo'}
                        </td>
                        <td className={`px-5 py-4 text-right font-bold ${profitClass}`}>{percent(row.margin)}</td>
                        <td className={`px-5 py-4 text-right font-bold ${row.stock <= 5 ? 'text-red-600' : ''}`}>{row.stock}</td>
                        <td className="px-5 py-4 text-right font-bold">{formatCurrency(row.potentialProfit)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {rows.length === 0 && <p className="p-10 text-center text-zinc-500">No hay productos activos.</p>}
          </div>
        </>
      )}
    </>
  )
}
