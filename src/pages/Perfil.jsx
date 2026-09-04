import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../hooks/useAuth'

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

    const { data } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', usuario.id)
      .single()


    if (data) {
      setForm({
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        teléfono: data.teléfono || '',
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
                value={form.teléfono}
                onChange={(e) =>
                  cambiar('teléfono', e.target.value)
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