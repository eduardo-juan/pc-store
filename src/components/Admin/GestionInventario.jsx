import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../supabaseClient'
import BotonAtras from '../../components/BotonAtras'
import {
  ShoppingCart,
  RotateCcw,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  CalendarDays,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const obtenerFechaLocal = (fecha = new Date()) => {
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function GestionInventario() {
  const [productos, setProductos] = useState([])
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [razon, setRazon] = useState('ajuste')
  const [operacion, setOperacion] = useState('entrada')
  const [fechaFiltro, setFechaFiltro] = useState('')
  const [pagina, setPagina] = useState(1)
  const registrosPorPagina = 10

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setCargando(true)

    const { data: productosData, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre, stock, marca')
      .order('nombre')

    if (productosError) {
      console.error('Error cargando productos:', productosError)
      alert(`Error al cargar los productos: ${productosError.message}`)
    }

    setProductos(productosData || [])

    const { data: historialData, error: historialError } = await supabase
      .from('inventario_historial')
      .select('*, productos(nombre)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (historialError) {
      console.error('Error cargando historial:', historialError)
      alert(`Error al cargar el historial: ${historialError.message}`)
    }

    setHistorial(historialData || [])
    setCargando(false)
  }

  const handleAjustarInventario = async (e) => {
    e.preventDefault()

    if (!productoSeleccionado || !cantidad) {
      alert('Completa todos los campos')
      return
    }

    const productoId = Number(productoSeleccionado)
    const producto = productos.find((p) => p.id === productoId)

    if (!producto) {
      alert('Producto no encontrado')
      return
    }

    const cantidadNum = parseInt(cantidad, 10)

    if (isNaN(cantidadNum) || cantidadNum <= 0) {
      alert('La cantidad debe ser un número mayor que 0')
      return
    }

    let nuevoStock

    if (razon === 'venta') {
      nuevoStock = producto.stock - cantidadNum
    } else if (razon === 'devolución') {
      nuevoStock = producto.stock + cantidadNum
    } else {
      nuevoStock =
        operacion === 'entrada' ? producto.stock + cantidadNum : producto.stock - cantidadNum
    }

    if (nuevoStock < 0) {
      alert(`No puedes reducir el stock por debajo de 0. Stock actual: ${producto.stock}`)
      return
    }

    const { error: historialError } = await supabase.from('inventario_historial').insert([
      {
        producto_id: productoId,
        cantidad_anterior: producto.stock,
        cantidad_nueva: nuevoStock,
        razón: razon,
      },
    ])

    if (historialError) {
      console.error('Error registrando historial:', historialError)
      alert(`Error al registrar el historial: ${historialError.message}`)
      return
    }

    const { error: updateError } = await supabase
      .from('productos')
      .update({ stock: nuevoStock })
      .eq('id', productoId)

    if (updateError) {
      console.error('Error actualizando stock:', updateError)
      alert(`Error al actualizar el stock: ${updateError.message}`)
      return
    }

    alert(
      `Inventario actualizado correctamente.\n\nStock anterior: ${producto.stock}\nStock nuevo: ${nuevoStock}`
    )
    resetFormulario()
    await cargarDatos()
    setPagina(1)
  }

  const resetFormulario = () => {
    setProductoSeleccionado('')
    setCantidad('')
    setRazon('ajuste')
    setOperacion('entrada')
  }

  const historialFiltrado = useMemo(() => {
    if (!fechaFiltro) return historial

    return historial.filter((item) => {
      if (!item.created_at) return false
      return obtenerFechaLocal(new Date(item.created_at)) === fechaFiltro
    })
  }, [historial, fechaFiltro])

  const totalPaginas = Math.max(1, Math.ceil(historialFiltrado.length / registrosPorPagina))

  const historialPaginado = useMemo(() => {
    const inicio = (pagina - 1) * registrosPorPagina
    return historialFiltrado.slice(inicio, inicio + registrosPorPagina)
  }, [historialFiltrado, pagina])

  useEffect(() => {
    setPagina((paginaActual) => Math.min(paginaActual, totalPaginas))
  }, [totalPaginas])

  const cambiarFechaFiltro = (valor) => {
    setFechaFiltro(valor)
    setPagina(1)
  }

  if (cargando) {
    return (
      <main className="pc-page">
        <div className="pc-container">
          <BotonAtras />
          Cargando...
        </div>
      </main>
    )
  }

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />

        <div className="pc-admin-header">
          <h1>Gestión de Inventario</h1>
          <p>Ajusta el stock y revisa el historial de movimientos.</p>
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24, alignItems: 'start' }}
        >
          <div className="pc-card" style={{ padding: 22 }}>
            <h2 style={{ marginBottom: 16 }}>Ajustar Stock</h2>

            <form
              onSubmit={handleAjustarInventario}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <select
                className="pc-select"
                value={productoSeleccionado}
                onChange={(e) => setProductoSeleccionado(e.target.value)}
                required
              >
                <option value="">Seleccionar producto</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} (Stock: {p.stock})
                  </option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                placeholder="Cantidad"
                className="pc-input"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
              />

              <select
                className="pc-select"
                value={razon}
                onChange={(e) => setRazon(e.target.value)}
              >
                <option value="venta">Venta</option>
                <option value="ajuste">Ajuste</option>
                <option value="devolución">Devolución</option>
              </select>

              {razon === 'ajuste' && (
                <select
                  className="pc-select"
                  value={operacion}
                  onChange={(e) => setOperacion(e.target.value)}
                >
                  <option value="entrada">Entrada (+) — Agregar stock</option>
                  <option value="salida">Salida (-) — Reducir stock</option>
                </select>
              )}

              <div
                className="pc-card"
                style={{ padding: 12, fontSize: 13, background: 'rgba(0,0,0,0.03)' }}
              >
                {razon === 'venta' && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingCart size={17} />
                    La venta reducirá el stock en <strong>{cantidad || 0}</strong>.
                  </p>
                )}
                {razon === 'devolución' && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RotateCcw size={17} />
                    La devolución aumentará el stock en <strong>{cantidad || 0}</strong>.
                  </p>
                )}
                {razon === 'ajuste' && operacion === 'entrada' && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ArrowDownToLine size={17} />
                    La entrada aumentará el stock en <strong>{cantidad || 0}</strong>.
                  </p>
                )}
                {razon === 'ajuste' && operacion === 'salida' && (
                  <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ArrowUpFromLine size={17} />
                    La salida reducirá el stock en <strong>{cantidad || 0}</strong>.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="pc-btn pc-btn-primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <RefreshCw size={17} />
                Actualizar
              </button>
            </form>
          </div>

          <div className="pc-card" style={{ padding: 22 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 16,
              }}
            >
              <h2 style={{ margin: 0 }}>Historial de Cambios</h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <CalendarDays size={18} />
                <input
                  type="date"
                  className="pc-input"
                  value={fechaFiltro}
                  max={obtenerFechaLocal()}
                  onChange={(e) => cambiarFechaFiltro(e.target.value)}
                  title="Filtrar movimientos por día"
                />

                {fechaFiltro && (
                  <button
                    type="button"
                    className="pc-btn pc-btn-light"
                    onClick={() => cambiarFechaFiltro('')}
                    style={{
                      width: 40,
                      height: 40,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                    }}
                    title="Borrar filtro"
                    aria-label="Borrar filtro"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>

            <p style={{ margin: '0 0 12px', fontSize: 13, opacity: 0.65 }}>
              {fechaFiltro
                ? `${historialFiltrado.length} movimiento(s) del ${new Date(`${fechaFiltro}T00:00:00`).toLocaleDateString('es-HN')}.`
                : `${historialFiltrado.length} movimiento(s) registrados.`}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {historialPaginado.length === 0 && (
                <p style={{ opacity: 0.6 }}>
                  {fechaFiltro
                    ? 'No hay movimientos registrados en ese día.'
                    : 'No hay movimientos registrados.'}
                </p>
              )}

              {historialPaginado.map((item) => (
                <div
                  key={item.id}
                  className="pc-card"
                  style={{ padding: 12, borderLeft: '4px solid #1e3a8a' }}
                >
                  <p style={{ fontWeight: 700 }}>
                    {item.productos?.nombre || 'Producto desconocido'}
                  </p>
                  <p style={{ fontSize: 13, opacity: 0.75 }}>
                    {item.cantidad_anterior} → {item.cantidad_nueva}
                    <span style={{ marginLeft: 8, color: '#1e3a8a', fontWeight: 700 }}>
                      ({item.razón})
                    </span>
                  </p>
                  <p style={{ fontSize: 11, opacity: 0.5 }}>
                    {new Date(item.created_at).toLocaleDateString('es-HN')}
                  </p>
                </div>
              ))}
            </div>

            {historialFiltrado.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  marginTop: 18,
                }}
              >
                <button
                  type="button"
                  className="pc-btn pc-btn-light"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  style={{
                    width: 40,
                    height: 40,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                  title="Página anterior"
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={18} />
                </button>

                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  Página {pagina} de {totalPaginas}
                </span>

                <button
                  type="button"
                  className="pc-btn pc-btn-light"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  style={{
                    width: 40,
                    height: 40,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                  title="Página siguiente"
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
