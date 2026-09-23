import { useMemo, useState } from 'react'
import BotonAtras from '../components/BotonAtras'
import {
  TIPOS_PILOTO,
  analizarCompatibilidadPiloto,
  nombreComponente,
  obtenerOpciones,
  obtenerResumenPiloto,
} from '../services/configuradorPilotService'

export default function ConfiguradorPiloto() {
  const [seleccionados, setSeleccionados] = useState({})
  const resultado = useMemo(() => analizarCompatibilidadPiloto(seleccionados), [seleccionados])
  const resumen = useMemo(() => obtenerResumenPiloto(seleccionados), [seleccionados])

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
    <main className='pc-page pc-pilot-page'>
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

      <section className='pc-pilot-layout'>
        <div className='pc-pilot-options'>
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
                    <option key={item.id} value={item.id} disabled={bloqueada}>
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

        <aside className='pc-card pc-pilot-summary'>
          <h2 style={{ marginTop: 0 }}>Resumen de configuración</h2>
          <p><strong>Componentes:</strong> {resumen.totalComponentes}/{resumen.totalComponentesDisponibles}</p>
          <p>
            <strong>Estado:</strong>{' '}
            <span style={{ color: resultado.errores.length ? '#991b1b' : '#166534' }}>
              {resultado.errores.length ? 'Incompatible' : 'Sin bloqueo'}
            </span>
          </p>

          {resumen.componentes.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {resumen.componentes.map((componente) => (
                <div key={componente.tipo} style={{ padding: 8, borderBottom: '1px solid #e2e8f0', fontSize: 13 }}>
                  <strong>{componente.etiqueta}:</strong> {componente.nombre}
                </div>
              ))}
            </div>
          )}

          <div style={{ padding: 12, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: 16 }}>
            <strong>Consumo y fuente</strong>
            <p style={{ margin: '8px 0 4px' }}>Consumo estimado: <strong>{resumen.consumoEstimado} W</strong></p>
            <p style={{ margin: '4px 0' }}>PSU recomendada: <strong>{resumen.psuRecomendada} W</strong></p>
            {resumen.psuSeleccionada != null && (
              <p style={{ margin: '4px 0' }}>
                PSU seleccionada: <strong>{resumen.psuSeleccionada} W</strong>
                {' · '}
                {resumen.margenPsuW >= 0 ? 'margen disponible' : 'por debajo de la recomendación'}
              </p>
            )}
          </div>

          {resumen.ramGb != null && <p><strong>RAM:</strong> {resumen.ramGb} GB</p>}
          {resumen.almacenamientoGb != null && <p><strong>Almacenamiento:</strong> {resumen.almacenamientoGb} GB</p>}

          <button type='button' className='pc-btn' onClick={() => setSeleccionados({})} style={{ width: '100%' }}>
            Limpiar configuración
          </button>

          <div style={{ marginTop: 20 }}>
            <h3>Relaciones verificadas</h3>
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