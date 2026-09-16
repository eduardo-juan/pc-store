import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { Eye, EyeOff, UserPlus } from 'lucide-react'

import { supabase } from '../../supabaseClient'

import BotonAtras from '../../components/BotonAtras'

import './RegistroEmpleado.css'

const inicial = {
  nombre: '',
  apellido: '',
  dni: '',
  teléfono: '',
  dirección: '',
  ciudad: '',
  país: 'Honduras',
  email: '',
  password: '',
  rol: 'empleado'
}

const texto = (v, n) =>
  v
    .replace(/[0-9]/g, '')
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s.'-]/g, '')
    .slice(0, n)

const tel = (v) => {
  const n = v.replace(/\D/g, '').slice(0, 8)

  return n.length > 4
    ? `${n.slice(0, 4)}-${n.slice(4)}`
    : n
}

const dni = (v) => {
  const n = v.replace(/\D/g, '').slice(0, 13)

  if (n.length <= 4) return n

  if (n.length <= 8) {
    return `${n.slice(0, 4)}-${n.slice(4)}`
  }

  return `${n.slice(0, 4)}-${n.slice(4, 8)}-${n.slice(8)}`
}

function Campo({
  label,
  value,
  error,
  onChange,
  maxLength,
  type = 'text',
  inputMode,
  placeholder
}) {
  return (
    <label>
      <span
        style={{
          display: 'block',
          marginBottom: 7,
          fontWeight: 600,
          color: error ? '#dc2626' : '#171717'
        }}
      >
        {label} <b className="pc-required">*</b>
      </span>

      <input
        className={`pc-input${
          error ? ' pc-empleado-input-error' : ''
        }`}
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />

      {error && (
        <small
          style={{
            display: 'block',
            marginTop: 5,
            color: '#dc2626'
          }}
        >
          Completa este campo.
        </small>
      )}
    </label>
  )
}

export default function RegistroEmpleado() {
  const navigate = useNavigate()

  const [form, setForm] = useState(inicial)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)

  const cambiar = (c, v) => {
    setForm((p) => ({
      ...p,
      [c]: v
    }))

    setErrores((p) => ({
      ...p,
      [c]: false
    }))

    setErrorGeneral('')
  }

  const validar = () => {
    const e = {}

    Object.entries(form).forEach(([c, v]) => {
      if (!String(v ?? '').trim()) {
        e[c] = true
      }
    })

    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      e.email = true
    }

    if (form.password && form.password.length < 6) {
      e.password = true
    }

    if (
      form.teléfono &&
      !/^\d{4}-\d{4}$/.test(form.teléfono)
    ) {
      e.teléfono = true
    }

    if (
      form.dni &&
      !/^\d{4}-\d{4}-\d{5}$/.test(form.dni)
    ) {
      e.dni = true
    }

    setErrores(e)

    return !Object.keys(e).length
  }

  const guardar = async (e) => {
    e.preventDefault()

    if (!validar()) return

    setGuardando(true)

    try {
      const { data, error } = await supabase.functions.invoke(
        'crear_empleado_api',
        {
          body: {
            ...form,
            email: form.email.trim().toLowerCase()
          }
        }
      )

      if (error) {
        throw new Error(error.message)
      }

      if (!data?.success) {
        throw new Error(
          data?.error || 'No se pudo crear el empleado.'
        )
      }

      navigate('/admin/empleados', {
        replace: true
      })
    } catch (e) {
      setErrorGeneral(e.message)
    } finally {
      setGuardando(false)
    }
  }

  const cambio = (c, e) => {
    let v = e.target.value

    if (['nombre', 'apellido', 'ciudad', 'país'].includes(c)) {
      v = texto(v, 50)
    }

    if (c === 'dni') v = dni(v)

    if (c === 'teléfono') v = tel(v)

    if (c === 'dirección') v = v.slice(0, 150)

    if (c === 'email') v = v.slice(0, 120)

    if (c === 'password') v = v.slice(0, 72)

    cambiar(c, v)
  }

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />

        <div className="pc-admin-header">
          <h1>Registrar empleado</h1>

          <p>
            Completa todos los datos para crear la cuenta del
            empleado.
          </p>
        </div>

        <form
          className="pc-card pc-profile-form"
          onSubmit={guardar}
          style={{
            maxWidth: 900,
            margin: '0 auto'
          }}
        >
          {errorGeneral && (
            <div
              style={{
                padding: 14,
                marginBottom: 20,
                color: '#b91c1c'
              }}
            >
              {errorGeneral}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              marginBottom: 22
            }}
          >
            <UserPlus size={22} />

            <h2>Datos del empleado</h2>
          </div>

          <div className="pc-form-grid">
            <Campo
              label="Nombre"
              value={form.nombre}
              error={errores.nombre}
              onChange={(e) => cambio('nombre', e)}
              maxLength={50}
            />

            <Campo
              label="Apellido"
              value={form.apellido}
              error={errores.apellido}
              onChange={(e) => cambio('apellido', e)}
              maxLength={50}
            />

            <Campo
              label="DNI"
              value={form.dni}
              error={errores.dni}
              onChange={(e) => cambio('dni', e)}
              maxLength={15}
              inputMode="numeric"
              placeholder="0801-1990-12345"
            />

            <Campo
              label="Teléfono"
              value={form.teléfono}
              error={errores.teléfono}
              onChange={(e) => cambio('teléfono', e)}
              maxLength={9}
              type="tel"
              inputMode="numeric"
              placeholder="9439-4343"
            />

            <Campo
              label="Ciudad"
              value={form.ciudad}
              error={errores.ciudad}
              onChange={(e) => cambio('ciudad', e)}
              maxLength={50}
            />

            <Campo
              label="País"
              value={form.país}
              error={errores.país}
              onChange={(e) => cambio('país', e)}
              maxLength={50}
            />

            <Campo
              label="Correo electrónico"
              value={form.email}
              error={errores.email}
              onChange={(e) => cambio('email', e)}
              maxLength={120}
              type="email"
            />
          </div>

          <label
            className="pc-empleado-field"
            style={{
              display: 'block',
              marginTop: 18
            }}
          >
            <span className="pc-required-label">
              Dirección <b className="pc-required">*</b>
            </span>

            <textarea
              className={`pc-textarea${
                errores.dirección
                  ? ' pc-empleado-textarea-error'
                  : ''
              }`}
              rows="3"
              maxLength={150}
              value={form.dirección}
              onChange={(e) => cambio('dirección', e)}
            />

            {errores.dirección && (
              <small>Completa este campo.</small>
            )}
          </label>

          <label
            className="pc-empleado-field"
            style={{
              display: 'block',
              marginTop: 18
            }}
          >
            <span className="pc-required-label">
              Contraseña <b className="pc-required">*</b>
            </span>

            <div className="pc-password-wrap">
              <input
                className={`pc-input${
                  errores.password
                    ? ' pc-empleado-input-error'
                    : ''
                }`}
                type={mostrarPassword ? 'text' : 'password'}
                maxLength={72}
                value={form.password}
                onChange={(e) => cambio('password', e)}
              />

              <button
                type="button"
                className="pc-password-toggle"
                aria-label={
                  mostrarPassword
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                }
                title={
                  mostrarPassword
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                }
                onClick={() =>
                  setMostrarPassword((v) => !v)
                }
              >
                {mostrarPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            {errores.password && (
              <small>Completa este campo.</small>
            )}
          </label>

          <label
            className="pc-empleado-field"
            style={{
              display: 'block',
              marginTop: 18
            }}
          >
            <span className="pc-required-label">
              Rol <b className="pc-required">*</b>
            </span>

            <select
              className="pc-input"
              value={form.rol}
              onChange={(e) => cambiar('rol', e.target.value)}
            >
              <option value="empleado">Empleado</option>
            </select>
          </label>

          <div style={{ marginTop: 22 }}>
            <button
              type="submit"
              className="pc-btn pc-btn-primary"
              disabled={guardando}
            >
              {guardando
                ? 'Creando cuenta...'
                : 'Crear cuenta de empleado'}
            </button>

            <button
              type="button"
              className="pc-btn pc-btn-light"
              onClick={() => navigate('/admin/empleados')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}