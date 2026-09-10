import { useEffect, useState } from 'react'
import { supabase } from '../../supabaseClient'
import {
  Plus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'

export default function GestionCategorias() {
  const [categorias, setCategorias] = useState([])
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarCategorias()
  }, [])

  const cargarCategorias = async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nombre')

    if (error) {
      setError(error.message)
      return
    }

    setCategorias(data || [])
  }

  const guardarCategoria = async (e) => {
    e.preventDefault()
    setError('')

    const datos = {
      nombre: nombre.trim(),
      descripción: descripcion.trim(),
    }

    let resultado

    if (editandoId) {
      resultado = await supabase
        .from('categorias')
        .update(datos)
        .eq('id', editandoId)
    } else {
      resultado = await supabase
        .from('categorias')
        .insert([datos])
    }

    if (resultado.error) {
      setError(resultado.error.message)
      return
    }

    limpiarFormulario()
    await cargarCategorias()
  }

  const editarCategoria = (categoria) => {
    setEditandoId(categoria.id)
    setNombre(categoria.nombre || '')
    setDescripcion(categoria.descripción || '')
  }

  const eliminarCategoria = async (id) => {
    const confirmar = window.confirm(
      '¿Deseas eliminar esta categoría?'
    )

    if (!confirmar) return

    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    await cargarCategorias()
  }

  const limpiarFormulario = () => {
    setNombre('')
    setDescripcion('')
    setEditandoId(null)
  }

  return (
    <main className="pc-page">
      <div className="pc-container">

        <div className="pc-admin-header">
          <h1>Gestión de Categorías</h1>
          <p>
            Crea y organiza las categorías del catálogo.
          </p>
        </div>

        <div
          className="pc-card"
          style={{
            padding: 22,
            marginBottom: 24,
          }}
        >
          <form
            className="pc-form-grid"
            onSubmit={guardarCategoria}
          >
            <input
              className="pc-input"
              placeholder="Nombre de categoría"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              required
            />

            <input
              className="pc-input"
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) =>
                setDescripcion(e.target.value)
              }
            />

            <div
              style={{
                display: 'flex',
                gap: 10,
              }}
            >
              <button
                className="pc-btn pc-btn-primary"
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Plus size={17} />
                {editandoId
                  ? 'Actualizar'
                  : 'Crear categoría'}
              </button>

              {editandoId && (
                <button
                  className="pc-btn pc-btn-light"
                  type="button"
                  onClick={limpiarFormulario}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <X size={17} />
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {error && (
          <div
            className="pc-card"
            style={{
              padding: 16,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        <div className="pc-card pc-table-wrapper">
          <table className="pc-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {categorias.map((categoria) => (
                <tr key={categoria.id}>
                  <td>{categoria.id}</td>
                  <td>{categoria.nombre}</td>
                  <td>{categoria.descripción}</td>

                  <td>
                    <button
                      className="pc-btn pc-btn-light"
                      onClick={() =>
                        editarCategoria(categoria)
                      }
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Pencil size={16} />
                      Editar
                    </button>

                    {' '}

                    <button
                      className="pc-btn pc-btn-danger"
                      onClick={() =>
                        eliminarCategoria(categoria.id)
                      }
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  )
}