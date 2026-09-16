import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut,
  Camera,
  CircleCheck,
  CircleX,
  Trash2,
} from 'lucide-react'

import { supabase } from '../supabaseClient'
import { useAuth } from '../hooks/useAuth'
import BotonAtras from '../components/BotonAtras'

const texto = (v, n) =>
  String(v)
    .replace(/[0-9]/g, '')
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s.'-]/g, '')
    .slice(0, n)

const formatearTelefono = (v) => {
  const n = String(v).replace(/\D/g, '').slice(0, 8)
  return n.length > 4 ? `${n.slice(0, 4)}-${n.slice(4)}` : n
}

const formatearDni = (v) => {
  const n = String(v).replace(/\D/g, '').slice(0, 13)

  if (n.length <= 4) return n
  if (n.length <= 8) return `${n.slice(0, 4)}-${n.slice(4)}`
  return `${n.slice(0, 4)}-${n.slice(4, 8)}-${n.slice(8)}`
}

export default function Perfil() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    teléfono: '',
    dirección: '',
    ciudad: '',
    país: 'Honduras',
  })

  const [avatarUrl, setAvatarUrl] = useState('')
  const [activo, setActivo] = useState(true)
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [cambiandoEstado, setCambiandoEstado] = useState(false)
  const [errores, setErrores] = useState({})
  const [mostrarEliminar, setMostrarEliminar] = useState(false)
  const [passwordEliminar, setPasswordEliminar] = useState('')
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false)

  const esEmpleado = usuario?.rol === 'empleado'

  useEffect(() => {
    if (usuario?.id) cargarPerfil()
  }, [usuario?.id])

  const cargarPerfil = async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', usuario.id)
      .single()

    if (error) {
      setMensaje(error.message)
      return
    }

    setForm({
      nombre: texto(data.nombre || '', 50),
      apellido: texto(data.apellido || '', 50),
      dni: formatearDni(data.dni || ''),
      teléfono: formatearTelefono(data.teléfono || ''),
      dirección: (data.dirección || '').slice(0, 150),
      ciudad: texto(data.ciudad || '', 50),
      país: texto(data.país || 'Honduras', 50),
    })

    setAvatarUrl(data.avatar_url || '')
    setActivo(data.activo !== false)
  }

  const cambiarCampo = (campo, valor) => {
    if (['nombre', 'apellido', 'ciudad', 'país'].includes(campo)) {
      valor = texto(valor, 50)
    }

    if (campo === 'dni') valor = formatearDni(valor)
    if (campo === 'teléfono') valor = formatearTelefono(valor)
    if (campo === 'dirección') valor = valor.slice(0, 150)

    setForm((prev) => ({ ...prev, [campo]: valor }))
    setErrores((prev) => ({ ...prev, [campo]: false }))
  }

  const cambiarEstadoEmpleado = async () => {
    if (!esEmpleado || cambiandoEstado) return

    setCambiandoEstado(true)
    setMensaje('')

    const nuevo = !activo

    const { error } = await supabase
      .from('usuarios')
      .update({
        activo: nuevo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', usuario.id)

    if (error) {
      setMensaje(error.message)
    } else {
      setActivo(nuevo)
      setMensaje(
        nuevo
          ? 'Ahora estás activo y puedes recibir nuevas órdenes.'
          : 'Ahora estás fuera de servicio y no recibirás nuevas órdenes.',
      )
    }

    setCambiandoEstado(false)
  }

  const subirFotoPerfil = async (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo || !usuario) return

    if (!archivo.type.startsWith('image/')) {
      setMensaje('Solo puedes seleccionar una imagen.')
      return
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setMensaje('La imagen no puede superar los 5 MB.')
      return
    }

    setSubiendoFoto(true)
    setMensaje('')

    try {
      const extension = archivo.type.split('/')[1] || 'jpg'
      const ruta = `${usuario.id}/avatar-${Date.now()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('avatares')
        .upload(ruta, archivo, {
          cacheControl: '3600',
          upsert: true,
          contentType: archivo.type,
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatares').getPublicUrl(ruta)
      const url = data?.publicUrl

      if (!url) throw new Error('No se pudo obtener la URL de la imagen.')

      const { error } = await supabase
        .from('usuarios')
        .update({
          avatar_url: url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', usuario.id)

      if (error) throw error

      setAvatarUrl(url)
      setMensaje('Foto de perfil actualizada correctamente.')
    } catch (error) {
      setMensaje(error.message || 'No se pudo actualizar la foto.')
    } finally {
      setSubiendoFoto(false)
      e.target.value = ''
    }
  }

  const guardar = async (e) => {
    e.preventDefault()

    const nuevos = {}

    if (!form.nombre.trim()) nuevos.nombre = true
    if (!form.apellido.trim()) nuevos.apellido = true

    if (!/^[0-9]{4}-[0-9]{4}$/.test(form.teléfono)) {
      nuevos.teléfono = true
    }

    if (!/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/.test(form.dni)) {
      nuevos.dni = true
    }

    setErrores(nuevos)

    if (Object.keys(nuevos).length) {
      setMensaje('Completa los campos obligatorios correctamente.')
      return
    }

    setGuardando(true)
    setMensaje('')

    const { error } = await supabase
      .from('usuarios')
      .update({
        ...form,
        updated_at: new Date().toISOString(),
      })
      .eq('id', usuario.id)

    if (error) {
      setMensaje(
        error.code === '23505' ||
          error.message?.toLowerCase().includes('dni')
          ? 'Este DNI ya está registrado por otro usuario.'
          : error.message,
      )
    } else {
      setMensaje('Perfil actualizado correctamente.')
    }

    setGuardando(false)
  }

  const eliminarCuenta = async () => {
    if (!usuario || esEmpleado || eliminandoCuenta) return

    if (!passwordEliminar.trim()) {
      setMensaje('Introduce tu contraseña para continuar.')
      return
    }

    if (
      !window.confirm(
        'Esta acción eliminará tu cuenta permanentemente. ¿Deseas continuar?',
      )
    ) {
      return
    }

    setEliminandoCuenta(true)
    setMensaje('')

    try {
      const { data, error } = await supabase.functions.invoke(
        'eliminar_cuenta_pc_store',
        {
          body: {
            password: passwordEliminar,
            target_user_id: usuario.id,
          },
        },
      )

      if (error) throw error
      if (data?.error) throw new Error(data.error)

      await logout()
      navigate('/')
    } catch (error) {
      setMensaje(error.message || 'No se pudo eliminar la cuenta.')
    } finally {
      setEliminandoCuenta(false)
    }
  }

  const cerrarSesion = async () => {
    await logout()
    navigate('/')
  }

  const et = (label, obligatorio = false) => (
    <>
      {label}
      {obligatorio && (
        <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>
      )}
    </>
  )

  const estiloCampo = (campo) => ({
    borderColor: errores[campo] ? '#dc2626' : undefined,
    boxShadow: errores[campo]
      ? '0 0 0 3px rgba(220,38,38,.12)'
      : undefined,
  })

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />
      </div>

      <div className="pc-container pc-profile-wrap">
        <section className="pc-card pc-profile-card">
          <div className="pc-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Foto de perfil" />
            ) : (
              (form.nombre?.[0] || usuario?.email?.[0] || 'U').toUpperCase()
            )}
          </div>

          <label className="pc-btn pc-btn-light pc-profile-photo-btn">
            <Camera size={17} />
            {subiendoFoto ? 'Subiendo...' : 'Cambiar foto'}
            <input
              type="file"
              accept="image/*"
              onChange={subirFotoPerfil}
              disabled={subiendoFoto}
              hidden
            />
          </label>

          <span className="pc-kicker">
            {esEmpleado ? 'Cuenta de empleado' : 'Mi cuenta'}
          </span>

          <div className="pc-profile-user">
            <h2>
              {form.nombre || 'Usuario'} {form.apellido}
            </h2>
            <p>{usuario?.email}</p>
          </div>

          {esEmpleado && (
            <div className="pc-status-card">
              <div className="pc-status-info">
                <div className="pc-status-title">
                  {activo ? (
                    <CircleCheck className="pc-status-icon-active" size={20} />
                  ) : (
                    <CircleX className="pc-status-icon-inactive" size={20} />
                  )}
                  <strong>Estado de trabajo</strong>
                </div>

                <span className={`pc-status-label ${activo ? 'activo' : 'inactivo'}`}>
                  {activo ? 'Activo' : 'Fuera de servicio'}
                </span>
              </div>

              <button
                type="button"
                className={`pc-btn ${activo ? 'pc-btn-light' : 'pc-btn-primary'} pc-status-button`}
                onClick={cambiarEstadoEmpleado}
                disabled={cambiandoEstado}
              >
                {cambiandoEstado
                  ? 'Guardando...'
                  : activo
                    ? 'Poner fuera de servicio'
                    : 'Activarme'}
              </button>
            </div>
          )}

          <div className="pc-profile-logout">
            <button type="button" className="pc-btn pc-btn-danger" onClick={cerrarSesion}>
              <LogOut size={17} />
              Cerrar sesión
            </button>
          </div>

          {!esEmpleado && (
            <div
              className="pc-profile-delete"
              style={{
                marginTop: 24,
                paddingTop: 24,
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <h3 style={{ color: '#b91c1c' }}>Eliminar cuenta</h3>
              <p>Esta acción es permanente y no se puede deshacer.</p>

              {!mostrarEliminar ? (
                <button
                  type="button"
                  className="pc-btn pc-btn-danger"
                  onClick={() => setMostrarEliminar(true)}
                >
                  <Trash2 size={17} />
                  Eliminar mi cuenta
                </button>
              ) : (
                <div>
                  <label>
                    Confirma tu contraseña
                    <input
                      className="pc-input"
                      type="password"
                      autoComplete="current-password"
                      value={passwordEliminar}
                      onChange={(e) => setPasswordEliminar(e.target.value)}
                      placeholder="Contraseña actual"
                    />
                  </label>

                  <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="pc-btn pc-btn-danger"
                      onClick={eliminarCuenta}
                      disabled={eliminandoCuenta}
                    >
                      <Trash2 size={17} />
                      {eliminandoCuenta ? 'Eliminando...' : 'Confirmar eliminación'}
                    </button>

                    <button
                      type="button"
                      className="pc-btn pc-btn-light"
                      onClick={() => {
                        setMostrarEliminar(false)
                        setPasswordEliminar('')
                        setMensaje('')
                      }}
                      disabled={eliminandoCuenta}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <form className="pc-card pc-profile-form" onSubmit={guardar}>
          <h2>Datos personales</h2>

          <div className="pc-form-grid">
            <label>
              {et('Nombre', true)}
              <input
                className="pc-input"
                maxLength={50}
                value={form.nombre}
                onChange={(e) => cambiarCampo('nombre', e.target.value)}
                style={estiloCampo('nombre')}
              />
            </label>

            <label>
              {et('Apellido', true)}
              <input
                className="pc-input"
                maxLength={50}
                value={form.apellido}
                onChange={(e) => cambiarCampo('apellido', e.target.value)}
                style={estiloCampo('apellido')}
              />
            </label>

            <label>
              {et('DNI', true)}
              <input
                className="pc-input"
                inputMode="numeric"
                maxLength={15}
                placeholder="0801-1990-12345"
                value={form.dni}
                onChange={(e) => cambiarCampo('dni', e.target.value)}
                style={estiloCampo('dni')}
              />
            </label>

            <label>
              {et('Teléfono', true)}
              <input
                className="pc-input"
                type="tel"
                inputMode="numeric"
                maxLength={9}
                placeholder="9439-4343"
                value={form.teléfono}
                onChange={(e) => cambiarCampo('teléfono', e.target.value)}
                style={estiloCampo('teléfono')}
              />
            </label>

            <label>
              {et('Ciudad')}
              <input
                className="pc-input"
                maxLength={50}
                value={form.ciudad}
                onChange={(e) => cambiarCampo('ciudad', e.target.value)}
              />
            </label>

            <label>
              {et('País')}
              <input
                className="pc-input"
                maxLength={50}
                value={form.país}
                onChange={(e) => cambiarCampo('país', e.target.value)}
              />
            </label>
          </div>

          <label>
            {et('Dirección')}
            <textarea
              className="pc-textarea"
              rows="3"
              maxLength={150}
              value={form.dirección}
              onChange={(e) => cambiarCampo('dirección', e.target.value)}
            />
          </label>

          {mensaje && <div className="pc-message">{mensaje}</div>}

          <button type="submit" disabled={guardando} className="pc-btn pc-btn-primary">
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </main>
  )
}
