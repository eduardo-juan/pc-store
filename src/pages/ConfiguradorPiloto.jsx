import { useMemo, useState } from 'react'
import BotonAtras from '../components/BotonAtras'
import {
  TIPOS_PILOTO,
  analizarCompatibilidadPiloto,
  nombreComponente,
  obtenerOpciones,
} from '../services/configuradorPilotService'

export default function ConfiguradorPiloto() {
  const [seleccionados, setSeleccionados] = useState({})
  const resultado = useMemo(() => analizarCompatibilidadPiloto(seleccionados), [seleccionados])

  function seleccionar(tipo, id) {
    const opciones = obtenerOpciones(tipo, seleccionados)
    const opcion = opciones.find(({ item }) => item.id === id)
    if (!opcion || opcion.bloqueada) return

    setSeleccionados((actual) => {
      const siguiente = { ...actual }
      if (opcion.item) siguiente[tipo] = opcion.item
      else delete siguiente[tipo]
      return siguiente
    })
  }

  return (
    <main className='pc-page' style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      <BotonAtras />

      <section className='pc-card' style={{ marginBottom: 24 }}>
        <h1 style={{ marginTop: 0 }}>Configurador de PC — Piloto externo</h1>
        <p>Prueba el catálogo externo sin modificar productos, precios, stock ni el configurador de producción.</p>
        <div style={{ padding: 12, borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <strong>Fuente:</strong> TechFuel HQ PC Builder Parts Dataset v2.1.0. Este catálogo no aporta precios ni stock comercial.
        </div>
      </section>

      {resultado.errores.length > 0 && (
        <section className='pc-card' style={{ marginBottom: 24, border: '1px solid #fca5a5', background: '#fef2f2' }}>
          <h2 style={{ color: '#991b1b', marginTop: 0 }}>Incompatibilidades</h2>
          <ul>{resultado.errores.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      )}

      {resultado.advertencias.length > 0 && (
        <section className='pc-card' style={{ marginBottom: 24, border: '1px solid #fcd34d', background: '#fffbeb' }}>
          <h2 style={{ color: '#92400e', marginTop: 0 }}>Advertencias</h2>
          <ul>{resultado.advertencias.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      )}

      <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {TIPOS_PILOTO.map(({ key, label }) => {
            const opciones = obtenerOpciones(key, seleccionados)

            return (
              <section className='pc-card' key={key}>
                <h2 style={{ marginTop: 0 }}>{label}</h2>
                <select
                  value={seleccionados[key]?.id ?? ''}
                  onChange={(event) => seleccionar(key, event.target.value)}
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff' }}
                >
                  <option value=''>Seleccionar {label.toLowerCase()}</option>
                  {opciones.map(({ item, bloqueada }) => (
                    <option
                      key={item.id}
                      value={item.id}
                      disabled={bloqueada}
                    >
                      {nombreComponente(item)}{bloqueada ? ' — incompatible' : ''}
                    </option>
                  ))}
                </select>
                <small style={{ display: 'block', marginTop: 8, color: '#64748b' }}>
                  Las opciones incompatibles con lo ya seleccionado aparecen bloqueadas. La falta de datos no bloquea.
                </small>
              </section>
            )
          })}
        </div>

        <aside className='pc-card' style={{ position: 'sticky', top: 20 }}>
          <h2 style={{ marginTop: 0 }}>Análisis</h2>
          <p>Componentes: {Object.keys(seleccionados).length}/{TIPOS_PILOTO.length}</p>
          <p>
            Estado:{' '}
            <strong style={{ color: resultado.errores.length ? '#991b1b' : '#166534' }}>
              {resultado.errores.length ? 'Incompatible' : 'Sin bloqueo'}
            </strong>
          </p>

          <button type='button' className='pc-btn' onClick={() => setSeleccionados({})} style={{ width: '100%' }}>
            Limpiar configuración
          </button>

          <div style={{ marginTop: 20 }}>
            {resultado.detalles.map((detalle, index) => (
              <div key={index} style={{ padding: 10, marginBottom: 8, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <strong>{detalle.relacion}</strong>
                <div style={{ fontSize: 13, marginTop: 4 }}>{detalle.mensaje}</div>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  )
}