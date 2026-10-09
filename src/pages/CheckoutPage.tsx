import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  CircleHelp,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserRound,
  WalletCards,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
} from 'react'
import {
  Link,
  Navigate,
} from 'react-router-dom'

import { useCart } from '../context/CartContext'
import { publicApi } from '../services/api'
import type { DeliveryForm } from '../types'
import { formatCurrency } from '../utils/currency'
import {
  buildWhatsAppHelpMessage,
  createWhatsAppUrl,
} from '../utils/whatsapp'

const departments = [
  'Ahuachapán',
  'Cabañas',
  'Chalatenango',
  'Cuscatlán',
  'La Libertad',
  'La Paz',
  'La Unión',
  'Morazán',
  'San Miguel',
  'San Salvador',
  'San Vicente',
  'Santa Ana',
  'Sonsonate',
  'Usulután',
]

const paymentMethods = [
  'Efectivo al recibir',
  'Transferencia bancaria',
  'Coordinar por WhatsApp',
]

const initialForm: DeliveryForm = {
  name: '',
  phone: '',
  department: '',
  municipality: '',
  address: '',
  reference: '',
  paymentMethod: paymentMethods[0],
  notes: '',
}

type FieldName = keyof DeliveryForm
type ValidationKey = FieldName | 'accepted'
type ValidationErrors = Partial<
  Record<ValidationKey, string>
>

const validationOrder: ValidationKey[] = [
  'name',
  'phone',
  'department',
  'municipality',
  'address',
  'reference',
  'paymentMethod',
  'notes',
  'accepted',
]

const fieldLabels: Record<ValidationKey, string> = {
  name: 'Nombre completo',
  phone: 'Teléfono',
  department: 'Departamento',
  municipality: 'Municipio o distrito',
  address: 'Dirección de entrega',
  reference: 'Punto de referencia',
  paymentMethod: 'Forma de pago',
  notes: 'Notas del pedido',
  accepted: 'Confirmación de datos',
}

function validateField(
  name: FieldName,
  value: string,
) {
  const trimmedValue = value.trim()

  switch (name) {
    case 'name':
      if (trimmedValue.length < 3) {
        return 'Escribe tu nombre completo.'
      }
      if (trimmedValue.length > 120) {
        return 'El nombre no puede superar 120 caracteres.'
      }
      return ''

    case 'phone': {
      const digits = trimmedValue.replace(/\D/g, '')
      if (digits.length < 8 || digits.length > 15) {
        return 'Ingresa un teléfono válido de 8 a 15 dígitos.'
      }
      return ''
    }

    case 'department':
      return departments.includes(trimmedValue)
        ? ''
        : 'Selecciona el departamento de entrega.'

    case 'municipality':
      if (trimmedValue.length < 2) {
        return 'Escribe tu municipio o distrito.'
      }
      if (trimmedValue.length > 100) {
        return 'El municipio no puede superar 100 caracteres.'
      }
      return ''

    case 'address':
      if (trimmedValue.length < 8) {
        return 'Escribe una dirección más detallada.'
      }
      if (trimmedValue.length > 300) {
        return 'La dirección no puede superar 300 caracteres.'
      }
      return ''

    case 'reference':
      return trimmedValue.length > 240
        ? 'La referencia no puede superar 240 caracteres.'
        : ''

    case 'paymentMethod':
      return paymentMethods.includes(trimmedValue)
        ? ''
        : 'Selecciona una forma de pago válida.'

    case 'notes':
      return trimmedValue.length > 500
        ? 'Las notas no pueden superar 500 caracteres.'
        : ''
  }
}

function validateCheckout(
  form: DeliveryForm,
  accepted: boolean,
) {
  const errors: ValidationErrors = {}

  for (const name of Object.keys(
    form,
  ) as FieldName[]) {
    const message = validateField(
      name,
      form[name],
    )
    if (message) errors[name] = message
  }

  if (!accepted) {
    errors.accepted =
      'Confirma que revisaste los datos antes de continuar.'
  }

  return errors
}

function normalizeForm(
  form: DeliveryForm,
): DeliveryForm {
  return {
    name: form.name.trim(),
    phone: form.phone.trim(),
    department: form.department.trim(),
    municipality: form.municipality.trim(),
    address: form.address.trim(),
    reference: form.reference.trim(),
    paymentMethod: form.paymentMethod.trim(),
    notes: form.notes.trim(),
  }
}

export function CheckoutPage() {
  const {
    items,
    subtotal,
    clearCart,
  } = useCart()

  const [form, setForm] =
    useState<DeliveryForm>(initialForm)
  const [accepted, setAccepted] =
    useState(false)
  const [fieldErrors, setFieldErrors] =
    useState<ValidationErrors>({})
  const [submitting, setSubmitting] =
    useState(false)
  const [submitError, setSubmitError] =
    useState<string | null>(null)
  const [supportNumber, setSupportNumber] =
    useState('')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    let active = true

    publicApi
      .storeSettings()
      .then((settings) => {
        if (active) {
          setSupportNumber(
            settings.whatsappNumber,
          )
        }
      })
      .catch(() => {
        // La ayuda puede abrir WhatsApp sin destinatario
        // si la configuración pública no está disponible.
      })

    return () => {
      active = false
    }
  }, [])

  const helpUrl = useMemo(
    () =>
      createWhatsAppUrl(
        buildWhatsAppHelpMessage(items),
        supportNumber,
      ),
    [items, supportNumber],
  )

  if (items.length === 0) {
    return (
      <Navigate
        to="/carrito"
        replace
      />
    )
  }

  const errorEntries = validationOrder
    .filter((name) => fieldErrors[name])
    .map((name) => ({
      name,
      label: fieldLabels[name],
      message: fieldErrors[name]!,
    }))

  const updateFieldError = (
    name: ValidationKey,
    message: string,
  ) => {
    setFieldErrors((current) => {
      const next = { ...current }
      if (message) next[name] = message
      else delete next[name]
      return next
    })
  }

  const handleChange = (
    event: ChangeEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >,
  ) => {
    const name = event.target.name as FieldName
    const { value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))
    setSubmitError(null)

    if (fieldErrors[name]) {
      updateFieldError(
        name,
        validateField(name, value),
      )
    }
  }

  const handleBlur = (
    event: FocusEvent<
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
    >,
  ) => {
    const name = event.target.name as FieldName
    updateFieldError(
      name,
      validateField(name, event.target.value),
    )
  }

  const focusFirstError = (
    errors: ValidationErrors,
  ) => {
    const firstError = validationOrder.find(
      (name) => errors[name],
    )
    if (!firstError) return

    window.requestAnimationFrame(() => {
      const target = formRef.current?.querySelector<HTMLElement>(
        `[name="${firstError}"]`,
      )
      target?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      target?.focus({ preventScroll: true })
    })
  }

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    if (submitting) return

    const normalizedForm = normalizeForm(form)
    const errors = validateCheckout(
      normalizedForm,
      accepted,
    )

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setSubmitError(null)
      focusFirstError(errors)
      return
    }

    setForm(normalizedForm)
    setFieldErrors({})
    setSubmitting(true)
    setSubmitError(null)

    try {
      const result = await publicApi.createOrder(
        normalizedForm,
        items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      )

      clearCart()
      window.location.assign(result.whatsappUrl)
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'No pudimos preparar la orden.',
      )
      setSubmitting(false)
    }
  }

  const getFieldClass = (
    name: FieldName,
  ) =>
    `mt-2 min-h-12 w-full rounded-2xl border bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 ${
      fieldErrors[name]
        ? 'border-red-500 ring-4 ring-red-50 focus:border-red-600 focus:ring-red-100'
        : 'border-zinc-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100'
    }`

  const renderFieldError = (
    name: FieldName,
  ) =>
    fieldErrors[name] ? (
      <span
        id={`${name}-error`}
        className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-700"
      >
        <CircleAlert
          size={15}
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        />
        {fieldErrors[name]}
      </span>
    ) : null

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <Link
        to="/carrito"
        className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-bold text-zinc-500 transition hover:text-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100"
      >
        <ArrowLeft
          size={17}
          aria-hidden="true"
        />
        Volver al carrito
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-extrabold tracking-[.12em] text-violet-700">
            ÚLTIMO PASO
          </p>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
            Paso 2 de 2
          </span>
        </div>

        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl">
          Datos de entrega
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-500">
          Completa la información para preparar tu pedido y revisarlo antes de enviarlo por WhatsApp.
        </p>
      </header>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 grid items-start gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_390px]"
      >
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-7 flex items-start gap-3 rounded-2xl bg-zinc-50 p-4 text-sm leading-6 text-zinc-600">
            <ShieldCheck
              size={20}
              className="mt-0.5 shrink-0 text-violet-700"
              aria-hidden="true"
            />
            <p>
              Usaremos estos datos únicamente para coordinar esta orden. Los campos marcados con
              <strong className="text-zinc-800"> *</strong> son obligatorios.
            </p>
          </div>

          {errorEntries.length > 0 && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-7 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900"
            >
              <div className="flex items-start gap-3">
                <CircleAlert
                  size={20}
                  className="mt-0.5 shrink-0 text-red-700"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-extrabold">
                    Falta información para continuar
                  </p>
                  <p className="mt-1 text-sm leading-6 text-red-800">
                    Revisa {errorEntries.length === 1
                      ? 'el campo indicado'
                      : `los ${errorEntries.length} campos indicados`} antes de enviar tu orden.
                  </p>
                  <ul className="mt-2 list-inside list-disc text-sm font-medium">
                    {errorEntries.map((error) => (
                      <li key={error.name}>
                        {error.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <fieldset>
            <legend className="flex items-center gap-3 font-display text-xl font-extrabold text-zinc-950">
              <span className="grid size-10 place-items-center rounded-xl bg-violet-100 text-violet-700">
                <UserRound
                  size={20}
                  aria-hidden="true"
                />
              </span>
              Información de contacto
            </legend>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Datos de la persona que recibirá el pedido.
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="font-bold text-zinc-800">
                Nombre completo
                <span className="text-red-600"> *</span>
                <input
                  id="name"
                  className={getFieldClass('name')}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="name"
                  placeholder="Tu nombre y apellido"
                  maxLength={120}
                  required
                  aria-invalid={Boolean(
                    fieldErrors.name,
                  )}
                  aria-describedby={
                    fieldErrors.name
                      ? 'name-error'
                      : undefined
                  }
                />
                {renderFieldError('name')}
              </label>

              <label className="font-bold text-zinc-800">
                Teléfono
                <span className="text-red-600"> *</span>
                <input
                  id="phone"
                  className={getFieldClass('phone')}
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="Ejemplo: 7000-0000"
                  maxLength={30}
                  required
                  aria-invalid={Boolean(
                    fieldErrors.phone,
                  )}
                  aria-describedby={
                    fieldErrors.phone
                      ? 'phone-error'
                      : 'phone-help'
                  }
                />
                {renderFieldError('phone')}
                {!fieldErrors.phone && (
                  <span
                    id="phone-help"
                    className="mt-2 block text-xs font-normal text-zinc-400"
                  >
                    Puedes escribirlo con o sin guiones.
                  </span>
                )}
              </label>
            </div>
          </fieldset>

          <fieldset className="mt-8 border-t border-zinc-200 pt-8">
            <legend className="flex items-center gap-3 font-display text-xl font-extrabold text-zinc-950">
              <span className="grid size-10 place-items-center rounded-xl bg-violet-100 text-violet-700">
                <MapPin
                  size={20}
                  aria-hidden="true"
                />
              </span>
              Dirección de entrega
            </legend>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Indica dónde debemos coordinar la entrega.
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="font-bold text-zinc-800">
                Departamento
                <span className="text-red-600"> *</span>
                <select
                  id="department"
                  className={getFieldClass(
                    'department',
                  )}
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="address-level1"
                  required
                  aria-invalid={Boolean(
                    fieldErrors.department,
                  )}
                  aria-describedby={
                    fieldErrors.department
                      ? 'department-error'
                      : undefined
                  }
                >
                  <option value="">
                    Selecciona
                  </option>
                  {departments.map(
                    (department) => (
                      <option
                        key={department}
                        value={department}
                      >
                        {department}
                      </option>
                    ),
                  )}
                </select>
                {renderFieldError('department')}
              </label>

              <label className="font-bold text-zinc-800">
                Municipio o distrito
                <span className="text-red-600"> *</span>
                <input
                  id="municipality"
                  className={getFieldClass(
                    'municipality',
                  )}
                  name="municipality"
                  value={form.municipality}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="address-level2"
                  placeholder="Tu municipio"
                  maxLength={100}
                  required
                  aria-invalid={Boolean(
                    fieldErrors.municipality,
                  )}
                  aria-describedby={
                    fieldErrors.municipality
                      ? 'municipality-error'
                      : undefined
                  }
                />
                {renderFieldError('municipality')}
              </label>

              <label className="font-bold text-zinc-800 sm:col-span-2">
                Dirección de entrega
                <span className="text-red-600"> *</span>
                <textarea
                  id="address"
                  className={`${getFieldClass(
                    'address',
                  )} min-h-28 resize-y py-3`}
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="street-address"
                  placeholder="Colonia, calle, número de casa..."
                  maxLength={300}
                  required
                  aria-invalid={Boolean(
                    fieldErrors.address,
                  )}
                  aria-describedby={
                    fieldErrors.address
                      ? 'address-error'
                      : undefined
                  }
                />
                {renderFieldError('address')}
              </label>

              <label className="font-bold text-zinc-800 sm:col-span-2">
                Punto de referencia
                <span className="font-normal text-zinc-400">
                  {' '}(opcional)
                </span>
                <input
                  id="reference"
                  className={getFieldClass(
                    'reference',
                  )}
                  name="reference"
                  value={form.reference}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Frente a, cerca de..."
                  maxLength={240}
                  aria-invalid={Boolean(
                    fieldErrors.reference,
                  )}
                  aria-describedby={
                    fieldErrors.reference
                      ? 'reference-error'
                      : undefined
                  }
                />
                {renderFieldError('reference')}
              </label>
            </div>
          </fieldset>

          <fieldset className="mt-8 border-t border-zinc-200 pt-8">
            <legend className="flex items-center gap-3 font-display text-xl font-extrabold text-zinc-950">
              <span className="grid size-10 place-items-center rounded-xl bg-violet-100 text-violet-700">
                <WalletCards
                  size={20}
                  aria-hidden="true"
                />
              </span>
              Preferencias del pedido
            </legend>

            <div className="mt-5 grid gap-5">
              <label className="font-bold text-zinc-800">
                Forma de pago
                <span className="text-red-600"> *</span>
                <select
                  id="paymentMethod"
                  className={getFieldClass(
                    'paymentMethod',
                  )}
                  name="paymentMethod"
                  value={form.paymentMethod}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  aria-invalid={Boolean(
                    fieldErrors.paymentMethod,
                  )}
                  aria-describedby={
                    fieldErrors.paymentMethod
                      ? 'paymentMethod-error'
                      : undefined
                  }
                >
                  {paymentMethods.map((method) => (
                    <option
                      key={method}
                      value={method}
                    >
                      {method}
                    </option>
                  ))}
                </select>
                {renderFieldError(
                  'paymentMethod',
                )}
              </label>

              <label className="font-bold text-zinc-800">
                Notas del pedido
                <span className="font-normal text-zinc-400">
                  {' '}(opcional)
                </span>
                <textarea
                  id="notes"
                  className={`${getFieldClass(
                    'notes',
                  )} min-h-24 resize-y py-3`}
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Horario preferido u otra indicación"
                  maxLength={500}
                  aria-invalid={Boolean(
                    fieldErrors.notes,
                  )}
                  aria-describedby={
                    fieldErrors.notes
                      ? 'notes-error'
                      : undefined
                  }
                />
                {renderFieldError('notes')}
              </label>
            </div>
          </fieldset>

          <div className="mt-8 border-t border-zinc-200 pt-7">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm leading-6 transition ${
                fieldErrors.accepted
                  ? 'border-red-300 bg-red-50 text-red-900'
                  : 'border-violet-100 bg-violet-50 text-zinc-700'
              }`}
            >
              <input
                type="checkbox"
                name="accepted"
                checked={accepted}
                onChange={(event) => {
                  const checked =
                    event.target.checked
                  setAccepted(checked)
                  setSubmitError(null)
                  updateFieldError(
                    'accepted',
                    checked
                      ? ''
                      : 'Confirma que revisaste los datos antes de continuar.',
                  )
                }}
                className="mt-1 size-5 shrink-0 accent-violet-700"
                required
                aria-invalid={Boolean(
                  fieldErrors.accepted,
                )}
                aria-describedby={
                  fieldErrors.accepted
                    ? 'accepted-error'
                    : undefined
                }
              />
              <span>
                Confirmo que los datos ingresados son correctos. El pedido quedará pendiente hasta recibir la confirmación por WhatsApp.
              </span>
            </label>

            {fieldErrors.accepted && (
              <p
                id="accepted-error"
                className="mt-2 flex items-start gap-1.5 text-sm font-medium text-red-700"
              >
                <CircleAlert
                  size={15}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                {fieldErrors.accepted}
              </p>
            )}
          </div>
        </div>

        <aside className="rounded-3xl bg-zinc-950 p-6 text-white shadow-xl shadow-zinc-950/10 sm:p-7 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl font-extrabold">
            Tu pedido
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Verifica productos, variantes y cantidades.
          </p>

          <div className="mt-6 grid gap-4">
            {items.map((item) => (
              <div
                key={item.cartId}
                className="flex items-start gap-3 border-b border-zinc-800 pb-4"
              >
                <img
                  src={
                    item.image ||
                    item.product.image
                  }
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="size-16 shrink-0 rounded-xl border border-zinc-800 bg-white object-contain p-1"
                />

                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-5">
                    {item.product.name}
                  </p>

                  {Object.keys(
                    item.selectedOptions,
                  ).length > 0 && (
                    <p className="mt-1 break-words text-xs leading-5 text-zinc-400">
                      {Object.entries(
                        item.selectedOptions,
                      )
                        .map(
                          ([name, value]) =>
                            `${name}: ${value}`,
                        )
                        .join(' · ')}
                    </p>
                  )}

                  <p className="mt-1 text-sm text-zinc-400">
                    Cantidad: {item.quantity}
                  </p>
                </div>

                <span className="shrink-0 font-bold">
                  {formatCurrency(
                    item.unitPrice *
                      item.quantity,
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-end justify-between gap-4">
            <span className="font-bold">
              Subtotal
            </span>
            <strong className="font-display text-2xl">
              {formatCurrency(subtotal)}
            </strong>
          </div>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            El envío se calcula y confirma según la dirección indicada.
          </p>

          {submitError && (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-5 rounded-2xl border border-red-900 bg-red-950/60 p-4 text-sm leading-6 text-red-100"
            >
              <p className="font-bold">
                No pudimos preparar tu orden
              </p>
              <p className="mt-1">
                {submitError} Tus datos y productos siguen guardados. Inténtalo nuevamente.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="mt-7 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#1fa855] px-5 text-center font-bold text-white shadow-lg shadow-black/20 transition hover:bg-[#187f42] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/40 disabled:cursor-wait disabled:opacity-60"
            disabled={submitting}
          >
            <MessageCircle
              size={20}
              aria-hidden="true"
            />
            {submitting
              ? 'Preparando orden...'
              : 'Enviar orden por WhatsApp'}
          </button>

          <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-zinc-400">
            <CheckCircle2
              size={16}
              className="mt-0.5 shrink-0 text-emerald-400"
              aria-hidden="true"
            />
            Revisarás el mensaje antes de enviarlo.
          </div>

          <div className="mt-6 border-t border-zinc-800 pt-5 text-center">
            <p className="text-xs leading-5 text-zinc-400">
              ¿Tienes problemas para completar tus datos?
            </p>
            <a
              href={helpUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold text-zinc-200 transition hover:bg-zinc-900 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-700"
            >
              <CircleHelp
                size={17}
                aria-hidden="true"
              />
              Pedir ayuda por WhatsApp
            </a>
            <p className="mt-2 text-[11px] leading-4 text-zinc-500">
              Esta opción no crea una orden ni vacía tu carrito.
            </p>
          </div>
        </aside>
      </form>
    </section>
  )
}



// import { ArrowLeft, CheckCircle2, MessageCircle } from 'lucide-react'
// import { useState, type ChangeEvent, type FormEvent } from 'react'
// import { Link, Navigate } from 'react-router-dom'
// import { useCart } from '../context/CartContext'
// import { publicApi } from '../services/api'
// import type { DeliveryForm } from '../types'
// import { formatCurrency } from '../utils/currency'

// const departments = [
//   'Ahuachapán',
//   'Cabañas',
//   'Chalatenango',
//   'Cuscatlán',
//   'La Libertad',
//   'La Paz',
//   'La Unión',
//   'Morazán',
//   'San Miguel',
//   'San Salvador',
//   'San Vicente',
//   'Santa Ana',
//   'Sonsonate',
//   'Usulután',
// ]

// const initialForm: DeliveryForm = {
//   name: '',
//   phone: '',
//   department: '',
//   municipality: '',
//   address: '',
//   reference: '',
//   paymentMethod: 'Efectivo al recibir',
//   notes: '',
// }

// export function CheckoutPage() {
//   const { items, subtotal, clearCart } = useCart()
//   const [form, setForm] = useState<DeliveryForm>(initialForm)
//   const [accepted, setAccepted] = useState(false)
//   const [submitting, setSubmitting] = useState(false)
//   const [submitError, setSubmitError] = useState<string | null>(null)

//   if (items.length === 0) return <Navigate to="/carrito" replace />

//   const handleChange = (
//     event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
//   ) => {
//     const { name, value } = event.target
//     setForm((current) => ({ ...current, [name]: value }))
//   }

//   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault()
//     if (!accepted || submitting) return
//     setSubmitting(true)
//     setSubmitError(null)
//     try {
//       const result = await publicApi.createOrder(
//         form,
//         items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
//       )
//       clearCart()
//       window.location.assign(result.whatsappUrl)
//     } catch (error) {
//       setSubmitError(error instanceof Error ? error.message : 'No pudimos preparar la orden.')
//       setSubmitting(false)
//     }
//   }

//   const fieldClass =
//     'mt-2 min-h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100'

//   return (
//     <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
//       <Link to="/carrito" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-violet-700"><ArrowLeft size={17} /> Volver al carrito</Link>
//       <div className="mt-7">
//         <p className="text-xs font-extrabold tracking-[.12em] text-violet-700">ÚLTIMO PASO</p>
//         <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Datos de entrega</h1>
//         <p className="mt-4 max-w-2xl text-zinc-500">Completa la información. Prepararemos el mensaje con tu pedido para enviarlo por WhatsApp.</p>
//       </div>

//       <form onSubmit={handleSubmit} className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_390px]">
//         <div className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-8">
//           <div className="grid gap-6 sm:grid-cols-2">
//             <label className="font-bold text-zinc-800 sm:col-span-2">
//               Nombre completo
//               <input className={fieldClass} name="name" value={form.name} onChange={handleChange} autoComplete="name" placeholder="Tu nombre y apellido" required />
//             </label>
//             <label className="font-bold text-zinc-800 sm:col-span-2">
//               Teléfono
//               <input className={fieldClass} name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" inputMode="tel" placeholder="Ejemplo: 7000-0000" required />
//             </label>
//             <label className="font-bold text-zinc-800">
//               Departamento
//               <select className={fieldClass} name="department" value={form.department} onChange={handleChange} required>
//                 <option value="">Selecciona</option>
//                 {departments.map((department) => <option key={department} value={department}>{department}</option>)}
//               </select>
//             </label>
//             <label className="font-bold text-zinc-800">
//               Municipio o distrito
//               <input className={fieldClass} name="municipality" value={form.municipality} onChange={handleChange} placeholder="Tu municipio" required />
//             </label>
//             <label className="font-bold text-zinc-800 sm:col-span-2">
//               Dirección de entrega
//               <textarea className={`${fieldClass} min-h-28 py-3`} name="address" value={form.address} onChange={handleChange} placeholder="Colonia, calle, número de casa..." required />
//             </label>
//             <label className="font-bold text-zinc-800 sm:col-span-2">
//               Punto de referencia <span className="font-normal text-zinc-400">(opcional)</span>
//               <input className={fieldClass} name="reference" value={form.reference} onChange={handleChange} placeholder="Frente a, cerca de..." />
//             </label>
//             <label className="font-bold text-zinc-800 sm:col-span-2">
//               Forma de pago
//               <select className={fieldClass} name="paymentMethod" value={form.paymentMethod} onChange={handleChange} required>
//                 <option>Efectivo al recibir</option>
//                 <option>Transferencia bancaria</option>
//                 <option>Coordinar por WhatsApp</option>
//               </select>
//             </label>
//             <label className="font-bold text-zinc-800 sm:col-span-2">
//               Notas del pedido <span className="font-normal text-zinc-400">(opcional)</span>
//               <textarea className={`${fieldClass} min-h-24 py-3`} name="notes" value={form.notes} onChange={handleChange} placeholder="Horario preferido u otra indicación" />
//             </label>
//           </div>

//           <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-2xl bg-violet-50 p-4 text-sm leading-6 text-zinc-700">
//             <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 size-5 accent-violet-700" required />
//             <span>Confirmo que los datos ingresados son correctos. El pedido quedará pendiente hasta recibir la confirmación por WhatsApp.</span>
//           </label>
//         </div>

//         <aside className="rounded-3xl bg-zinc-950 p-6 text-white lg:sticky lg:top-28">
//           <h2 className="font-display text-2xl font-extrabold">Tu pedido</h2>
//           <div className="mt-6 grid gap-4">
//             {items.map((item) => (
//               <div key={item.cartId} className="flex gap-3 border-b border-zinc-800 pb-4">
//                 <img
//                   src={item.image || item.product.image}
//                   alt=""
//                   className="size-16 rounded-xl border border-zinc-800 bg-white object-contain p-1"
//                 />
//                 <div className="min-w-0 flex-1">
//                   <p className="truncate font-bold">{item.product.name}</p>
//                   {Object.keys(item.selectedOptions).length > 0 && (
//                     <p className="mt-1 truncate text-xs text-zinc-400">
//                       {Object.entries(item.selectedOptions)
//                         .map(([name, value]) => `${name}: ${value}`)
//                         .join(' · ')}
//                     </p>
//                   )}
//                   <p className="mt-1 text-sm text-zinc-400">Cantidad: {item.quantity}</p>
//                 </div>
//                 <span className="font-bold">{formatCurrency(item.unitPrice * item.quantity)}</span>
//               </div>
//             ))}
//           </div>
//           <div className="mt-6 flex items-center justify-between"><span>Subtotal</span><strong className="font-display text-2xl">{formatCurrency(subtotal)}</strong></div>
//           <p className="mt-3 text-sm leading-6 text-zinc-400">El envío se calcula y confirma según la dirección indicada.</p>
//           {submitError && <p role="alert" className="mt-5 rounded-2xl bg-red-950/60 p-4 text-sm text-red-100">{submitError}</p>}
//           <button type="submit" className="mt-7 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#1fa855] px-5 font-bold text-white transition hover:bg-[#187f42] disabled:cursor-not-allowed disabled:opacity-50" disabled={!accepted || submitting}>
//             <MessageCircle size={20} /> {submitting ? 'Preparando orden...' : 'Enviar orden por WhatsApp'}
//           </button>
//           <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-zinc-400"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" /> Revisarás el mensaje antes de enviarlo.</div>
//         </aside>
//       </form>
//     </section>
//   )
// }

