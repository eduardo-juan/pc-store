import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../hooks/useAuth'

const formatearTelefono = (valor = '') => {
  const numeros = String(valor)
    .replace(/\D/g, '')
    .slice(0, 8)

  if (numeros.length <= 4) {
    return numeros
  }

  return `${numeros.slice(0, 4)}-${numeros.slice(4)}`
}

export default function Perfil() {

  const { usuario } = useAuth()

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    teléfono: '',
    dirección: '',
    ciudad: '',
    país: 'Honduras',
  })

  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)


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
        teléfono: formatearTelefono(data.teléfono || ''),
        dirección: data.dirección || '',
        ciudad: data.ciudad || '',
        país: data.país || 'Honduras',
      })
    }
  }


  const cambiar = (campo, valor) => {
    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }))
  }


  const guardar = async (e) => {

    e.preventDefault()

    if (!usuario) {
      setMensaje('Debes iniciar sesión para guardar tu perfil.')
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
      setMensaje(error.message)
    } else {
      setMensaje('Perfil actualizado correctamente.')
    }


    setGuardando(false)
  }


  return (
    <main className="pc-page">

      <div className="pc-container pc-profile-wrap">

        <section className="pc-card pc-profile-card">

          <div className="pc-avatar">
            {(form.nombre?.[0] || usuario?.email?.[0] || 'U')
              .toUpperCase()}
          </div>

          <span className="pc-kicker">
            Mi cuenta
          </span>

          <h1>
            {form.nombre || 'Usuario'}
            {' '}
            {form.apellido}
          </h1>

          <p>{usuario?.email}</p>

        </section>


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