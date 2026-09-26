import { History } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AdminPageHeader } from '../../components/admin/AdminUi'
import { adminApi } from '../../services/api'

interface AuditLog { id: string; action: string; entityType: string; entityId?: string; ipAddress?: string; createdAt: string; actor?: { name: string; email: string } }

export function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { adminApi.get<{ data: { logs: AuditLog[] } }>('/admin/audit').then(({ data }) => setLogs(data.logs)).catch((err) => setError(err.message)) }, [])
  return <><AdminPageHeader eyebrow="SEGURIDAD" title="Registro de auditoría" description="Historial de accesos y cambios administrativos importantes." />{error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}<div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-zinc-950 text-zinc-300"><tr><th className="px-5 py-4">Fecha</th><th className="px-5 py-4">Administrador</th><th className="px-5 py-4">Acción</th><th className="px-5 py-4">Entidad</th><th className="px-5 py-4">IP</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id} className="border-b border-zinc-100"><td className="px-5 py-4 text-zinc-500">{new Date(log.createdAt).toLocaleString('es-SV')}</td><td className="px-5 py-4"><p className="font-bold">{log.actor?.name ?? 'Sistema'}</p><p className="text-xs text-zinc-400">{log.actor?.email}</p></td><td className="px-5 py-4 font-bold text-violet-700">{log.action}</td><td className="px-5 py-4">{log.entityType}<span className="ml-2 text-xs text-zinc-400">{log.entityId}</span></td><td className="px-5 py-4 font-mono text-xs">{log.ipAddress ?? '—'}</td></tr>)}</tbody></table></div>{logs.length === 0 && <div className="grid place-items-center gap-3 p-12 text-zinc-400"><History size={28} /><p>No hay eventos para mostrar.</p></div>}</div></>
}
