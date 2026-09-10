import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../hooks/useAuth'

const formatearTelefono = (valor = '') => {
  const numeros = String(valor)
    .replace(/\D/g, '')
    .slice(0, 8)

  if (numeros.length <= 4) return numeros

  return `${numeros.slice(0, 4)}-${numeros.slice(4)}`
}

const formatearDni = (valor = '') => {
  const numeros = String(valor)
    .replace(/\D/g, '')
    .slice(0, 13)

  if (numeros.length <= 4) return numeros

  if (numeros.length <= 8) {
    return `${numeros.slice(0, 4)}-${numeros.slice(4)}`
  }

  return `${numeros.slice(0, 4)}-${numeros.slice(4, 8)}-${numeros.slice(8)}`
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

  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [subiendoFoto, setSubiendoFoto] = useState(false)

  useEffect(() => {
    cargarPerfil()
  }, [usuario])

  const cargarPerfil = async () => {
    if (!usuario) return

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', usuario.id)
      .single()

    if (error) {
      setMensaje(error.message)
      return
    }

    if (data) {
      setForm({
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        dni: formatearDni(data.dni || ''),
        teléfono: formatearTelefono(data.teléfono || ''),
        dirección: data.dirección || '',
        ciudad: data.ciudad || '',
        país: data.país || 'Honduras',
      })

      setAvatarUrl(data.avatar_url || null)
    }
  }

  // ==============================
  // SUBIR FOTO
  // ==============================

  const subirFotoPerfil = async (e) => {
    const archivo = e.target.files?.[0]

    if (!archivo || !usuario) return

    if (!archivo.type.startsWith('image/')) {
      setMensaje('Solo puedes seleccionar una imagen.')
      e.target.value = ''
      return
    }

    const maximoMB = 5
    const maximoBytes = maximoMB * 1024 * 1024

    if (archivo.size > maximoBytes) {
      setMensaje(`La imagen no puede superar los ${maximoMB} MB.`)
      e.target.value = ''
      return
    }

    setSubiendoFoto(true)
    setMensaje('')

    try {
      const extension =
        archivo.type.split('/')[1]?.toLowerCase() || 'jpg'

      const ruta = `${usuario.id}/avatar-${Date.now()}.${extension}`

      const { error: subidaError } = await supabase.storage
        .from('avatares')
        .upload(ruta, archivo, {
          cacheControl: '3600',
          upsert: true,
          contentType: archivo.type,
        })

      if (subidaError) {
        throw new Error(
          `Error al subir la foto: ${subidaError.message}`
        )
      }

      const { data: urlData } = supabase.storage
        .from('avatares')
        .getPublicUrl(ruta)

      const nuevaUrl = urlData?.publicUrl

      if (!nuevaUrl) {
        throw new Error(
          'No se pudo obtener la URL de la imagen.'
        )
      }

      const { error: updateError } = await supabase
        .from('usuarios')
        .update({
          avatar_url: nuevaUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', usuario.id)

      if (updateError) {
        throw new Error(
          `La foto se subió, pero no se pudo guardar el perfil: ${updateError.message}`
        )
      }

      setAvatarUrl(nuevaUrl)
      setMensaje('Foto de perfil actualizada correctamente.')

      e.target.value = ''
    } catch (error) {
      console.error('Error al cambiar foto:', error)

      setMensaje(
        error.message || 'No se pudo actualizar la foto.'
      )
    } finally {
      setSubiendoFoto(false)
    }
  }

  // ==============================
  // CERRAR SESIÓN
  // ==============================

  const cerrarSesion = async () => {
    await logout()
    navigate('/')
  }

  // ==============================
  // CAMBIAR CAMPOS
  // ==============================

  const cambiar = (campo, valor) => {
    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }))
  }

  // ==============================
  // GUARDAR PERFIL
  // ==============================

  const guardar = async (e) => {
    e.preventDefault()

    if (!usuario) {
      setMensaje(
        'Debes iniciar sesión para guardar tu perfil.'
      )
      return
    }

    if (
      form.teléfono &&
      !/^[0-9]{4}-[0-9]{4}$/.test(form.teléfono)
    ) {
      setMensaje(
        'El teléfono debe tener el formato 9439-4343.'
      )
      return
    }

    if (
      form.dni &&
      !/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/.test(form.dni)
    ) {
      setMensaje(
        'El DNI debe tener el formato ####-####-#####.'
      )
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
      if (
        error.code === '23505' ||
        error.message?.toLowerCase().includes('dni')
      ) {
        setMensaje(
          'Este DNI ya está registrado por otro usuario.'
        )
      } else {
        setMensaje(error.message)
      }
    } else {
      setMensaje('Perfil actualizado correctamente.')
    }

    setGuardando(false)
  }

  return (
    <main className="pc-page">
      <div className="pc-container pc-profile-wrap">

        {/* PERFIL */}

        <section className="pc-card pc-profile-card">

          <div
            className="pc-avatar"
            style={{
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Foto de perfil"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 'inherit',
                }}
              />
            ) : (
              (
                form.nombre?.[0] ||
                usuario?.email?.[0] ||
                'U'
              ).toUpperCase()
            )}
          </div>

          <label
            className="pc-btn pc-btn-light"
            style={{
              cursor: subiendoFoto
                ? 'not-allowed'
                : 'pointer',
              display: 'inline-block',
              opacity: subiendoFoto ? 0.7 : 1,
            }}
          >
            {subiendoFoto
              ? 'Subiendo...'
              : 'Cambiar foto'}

            <input
              type="file"
              accept="image/*"
              onChange={subirFotoPerfil}
              disabled={subiendoFoto}
              style={{
                display: 'none',
              }}
            />
          </label>

          <span className="pc-kicker">
            Mi cuenta
          </span>

          <h1>
            {form.nombre || 'Usuario'}{' '}
            {form.apellido}
          </h1>

          <p>{usuario?.email}</p>

          <button
            type="button"
            className="pc-btn pc-btn-danger"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>
        </section>

        {/* DATOS PERSONALES */}

        <form
          className="pc-card pc-profile-form"
          onSubmit={guardar}
        >
          <h2>Datos personales</h2>

          <div className="pc-form-grid">

            <label>
              Nombre

              <input
                className="pc-input"
                value={form.nombre}
                onChange={(e) =>
                  cambiar('nombre', e.target.value)
                }
              />
            </label>

            <label>
              Apellido

              <input
                className="pc-input"
                value={form.apellido}
                onChange={(e) =>
                  cambiar('apellido', e.target.value)
                }
              />
            </label>

            <label>
              DNI

              <input
                className="pc-input"
                type="text"
                inputMode="numeric"
                maxLength={15}
                placeholder="0801-1990-12345"
                value={form.dni}
                onChange={(e) =>
                  cambiar(
                    'dni',
                    formatearDni(e.target.value)
                  )
                }
              />
            </label>

            <label>
              Teléfono

              <input
                className="pc-input"
                type="tel"
                inputMode="numeric"
                maxLength={9}
                placeholder="9439-4343"
                value={form.teléfono}
                onChange={(e) =>
                  cambiar(
                    'teléfono',
                    formatearTelefono(e.target.value)
                  )
                }
              />
            </label>

            <label>
              Ciudad

              <input
                className="pc-input"
                value={form.ciudad}
                onChange={(e) =>
                  cambiar('ciudad', e.target.value)
                }
              />
            </label>

            <label>
              País

              <input
                className="pc-input"
                value={form.país}
                onChange={(e) =>
                  cambiar('país', e.target.value)
                }
              />
            </label>
          </div>

          <label>
            Dirección

            <textarea
              className="pc-textarea"
              rows="3"
              value={form.dirección}
              onChange={(e) =>
                cambiar('dirección', e.target.value)
              }
            />
          </label>

          {mensaje && (
            <div className="pc-message">
              {mensaje}
            </div>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="pc-btn pc-btn-primary"
          >
            {guardando
              ? 'Guardando...'
              : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </main>
  )
}