import { Save, ShieldAlert } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { AdminPageHeader, Panel, inputClass, primaryButton } from '../../components/admin/AdminUi'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { adminApi } from '../../services/api'

const empty = { storeName: '', whatsappNumber: '', supportMessage: '', deliveryMessage: '' }

export function AdminSettingsPage() {
  const { user } = useAdminAuth()
  const [form, setForm] = useState(empty)
  const [message, setMessage] = useState<string | null>(null)
  useEffect(() => { adminApi.get<{ data: { settings: typeof empty | null } }>('/admin/settings').then(({ data }) => data.settings && setForm(data.settings)).catch((err) => setMessage(err.message)) }, [])
  const submit = async (event: FormEvent) => { event.preventDefault(); try { await adminApi.mutate('/admin/settings', { method: 'PUT', body: JSON.stringify(form) }); setMessage('Configuración guardada.') } catch (err) { setMessage(err instanceof Error ? err.message : 'No se pudo guardar.') } }
  return <><AdminPageHeader eyebrow="TIENDA" title="Configuración" description="Información comercial utilizada por el frontend y los pedidos." /><Panel className="max-w-2xl"><form onSubmit={submit} className="grid gap-5"><label className="text-sm font-bold">Nombre de la tienda<input className={`${inputClass} mt-2`} value={form.storeName} onChange={(event) => setForm({ ...form, storeName: event.target.value })} disabled={user?.role !== 'SUPERADMIN'} required /></label><label className="text-sm font-bold">Número de WhatsApp<input className={`${inputClass} mt-2`} value={form.whatsappNumber} onChange={(event) => setForm({ ...form, whatsappNumber: event.target.value })} disabled={user?.role !== 'SUPERADMIN'} required /><span className="mt-1 block text-xs font-normal text-zinc-400">Código de país y número, sin espacios. Ejemplo: 50370000000.</span></label><label className="text-sm font-bold">Mensaje de atención<input className={`${inputClass} mt-2`} value={form.supportMessage} onChange={(event) => setForm({ ...form, supportMessage: event.target.value })} disabled={user?.role !== 'SUPERADMIN'} required /></label><label className="text-sm font-bold">Mensaje de entrega<input className={`${inputClass} mt-2`} value={form.deliveryMessage} onChange={(event) => setForm({ ...form, deliveryMessage: event.target.value })} disabled={user?.role !== 'SUPERADMIN'} required /></label>{user?.role === 'SUPERADMIN' ? <button type="submit" className={primaryButton}><Save size={17} /> Guardar configuración</button> : <p className="flex items-center gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-800"><ShieldAlert size={18} /> Solo el superadministrador puede cambiar esta configuración.</p>}{message && <p className="rounded-xl bg-violet-50 p-4 text-sm text-violet-800">{message}</p>}</form></Panel></>
}
