import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { inputClass, primaryButton } from '../../components/admin/AdminUi'
import { useAdminAuth } from '../../context/AdminAuthContext'

export function AdminLoginPage() {
  const { user, login } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  if (user) return <Navigate to="/admin" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(email, password)
      const target = (location.state as { from?: string } | null)?.from ?? '/admin'
      navigate(target, { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No pudimos iniciar sesión.')
    } finally { setSubmitting(false) }
  }

  return (
    <main className="grid min-h-screen bg-zinc-950 lg:grid-cols-2">
      <section className="hidden flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_25%_20%,#7c3aed_0%,#30125a_32%,#09090b_72%)] p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2 font-bold text-violet-100"><ArrowLeft size={18} /> Volver a la tienda</Link>
        <div><span className="grid size-16 place-items-center rounded-2xl bg-white/10 backdrop-blur"><ShieldCheck size={30} /></span><h1 className="mt-8 max-w-lg font-display text-5xl font-extrabold leading-tight tracking-tight">Control seguro para toda tu tienda.</h1><p className="mt-5 max-w-lg text-lg leading-8 text-violet-100/80">Gestiona catálogo, inventario y pedidos desde un espacio reservado para el equipo administrativo.</p></div>
        <p className="text-sm text-violet-200/60">UrbanoSV Administración</p>
      </section>
      <section className="flex items-center justify-center bg-white px-5 py-12">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-zinc-500 lg:hidden"><ArrowLeft size={17} /> Volver a la tienda</Link>
          <span className="grid size-14 place-items-center rounded-2xl bg-violet-100 text-violet-700"><LockKeyhole size={25} /></span>
          <p className="mt-7 text-xs font-extrabold tracking-[.12em] text-violet-700">ACCESO RESTRINGIDO</p>
          <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight">Iniciar sesión</h2>
          <p className="mt-3 text-zinc-500">Disponible únicamente para administradores autorizados.</p>
          <form onSubmit={submit} className="mt-8 grid gap-5">
            <label className="text-sm font-bold">Correo administrativo<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className={`${inputClass} mt-2`} required /></label>
            <label className="text-sm font-bold">Contraseña<div className="relative mt-2"><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className={`${inputClass} pr-12`} required /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute inset-y-0 right-0 grid w-12 place-items-center text-zinc-500" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div></label>
            {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
            <button type="submit" disabled={submitting} className={`${primaryButton} mt-2 w-full`}>{submitting ? 'Verificando...' : 'Entrar al panel'}</button>
          </form>
          <p className="mt-7 text-xs leading-5 text-zinc-400">Los intentos de acceso son supervisados y registrados por seguridad.</p>
        </div>
      </section>
    </main>
  )
}
