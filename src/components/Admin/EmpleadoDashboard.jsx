import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, BarChart3, Tags, FileText, Bell, CheckCircle2, WalletCards } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import BotonAtras from '../../components/BotonAtras'

export default function EmpleadoDashboard() {
  const { usuario, perfil } = useAuth()
  const [metricas, setMetricas] = useState({ ordenes: 0, ventas: 0, pendientes: 0, pagadas: 0, enviadas: 0, entregadas: 0, activas: 0, comisiones: 0 })
  const [ordenesDisponibles, setOrdenesDisponibles] = useState([])
  const [maxOrdenes, setMaxOrdenes] = useState(5)
  const [cargando, setCargando] = useState(true)
  const [aceptando, setAceptando] = useState(null)
  const [error, setError] = useState('')

  const cargarDatos = useCallback(async () => {
    if (!usuario?.id) return
    setError('')
    const [ordenesResult, disponiblesResult, comisionesResult, configResult] = await Promise.all([
      supabase.from('ordenes').select('id,total,estado,empleado_id,created_at').eq('empleado_id', usuario.id),
      supabase.rpc('obtener_ordenes_disponibles_empleado'),
      supabase.from('empleado_comisiones').select('monto').eq('empleado_id', usuario.id),
      supabase.rpc('obtener_configuracion_entregas'),
    ])
    if (ordenesResult.error) setError(ordenesResult.error.message)
    if (disponiblesResult.error) setError(disponiblesResult.error.message)
    if (comisionesResult.error) setError(comisionesResult.error.message)
    if (configResult.error) setError(configResult.error.message)
    const ordenes = ordenesResult.data || []
    const config = configResult.data?.[0]
    setMaxOrdenes(Number(config?.max_ordenes_activas) || 5)
    setOrdenesDisponibles(disponiblesResult.data || [])
    setMetricas({
      ordenes: ordenes.length,
      ventas: ordenes.filter((o) => o.estado === 'pagada').reduce((s, o) => s + Number(o.total || 0), 0),
      pendientes: ordenes.filter((o) => o.estado === 'pendiente').length,
      pagadas: ordenes.filter((o) => o.estado === 'pagada').length,
      enviadas: ordenes.filter((o) => o.estado === 'enviada').length,
      entregadas: ordenes.filter((o) => o.estado === 'entregada').length,
      activas: ordenes.filter((o) => ['pendiente', 'pagada', 'enviada'].includes(o.estado)).length,
      comisiones: (comisionesResult.data || []).reduce((s, c) => s + Number(c.monto || 0), 0),
    })
    setCargando(false)
  }, [usuario?.id])

  useEffect(() => {
    cargarDatos()
    const intervalo = window.setInterval(cargarDatos, 8000)
    return () => window.clearInterval(intervalo)
  }, [cargarDatos])

  const aceptarOrden = async (ordenId) => {
    setAceptando(ordenId)
    setError('')
    const { error: rpcError } = await supabase.rpc('aceptar_orden_empleado', { p_orden_id: ordenId })
    if (rpcError) setError(rpcError.message || 'No se pudo aceptar la orden.')
    await cargarDatos()
    setAceptando(null)
  }

  const opciones = [
    { icono: FileText, titulo: 'Órdenes', ruta: '/admin/ordenes' },
    { icono: WalletCards, titulo: 'Mis comisiones', ruta: '/admin/empleado/comisiones' },
  ]

  if (cargando) return <main className="pc-page"><div className="pc-container"><BotonAtras /><div className="pc-loading"><div className="pc-loader" /><p>Cargando información...</p></div></div></main>

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />
        <div className="pc-page-heading"><div><span className="pc-kicker" style={{ color: '#171717' }}>Panel de empleado</span><h1 style={{ color: '#171717' }}>Hola, {perfil?.nombre || 'Empleado'}</h1><p style={{ color: '#171717' }}>Las nuevas órdenes aparecen aquí automáticamente. Elige las que quieras gestionar.</p></div></div>
        {error && <div className="pc-card" style={{ padding: 16, marginBottom: 20, color: '#dc2626' }}>{error}</div>}
        <div className="pc-metrics-grid">
          <article className="pc-card pc-metric"><span style={{ color: '#171717' }}>Órdenes activas</span><strong style={{ color: '#171717' }}>{metricas.activas} / {maxOrdenes}</strong></article>
          <article className="pc-card pc-metric"><span style={{ color: '#171717' }}>Órdenes gestionadas</span><strong style={{ color: '#171717' }}>{metricas.ordenes}</strong></article>
          <article className="pc-card pc-metric"><span style={{ color: '#171717' }}>Entregadas</span><strong style={{ color: '#171717' }}>{metricas.entregadas}</strong></article>
          <article className="pc-card pc-metric"><span style={{ color: '#171717' }}>Comisiones</span><strong style={{ color: '#171717' }}>L {metricas.comisiones.toFixed(2)}</strong></article>
        </div>
        <section className="pc-card" style={{ padding: 20, marginBottom: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}><div><h2 style={{ margin: 0, color: '#171717' }}><Bell size={20} style={{ verticalAlign: 'middle', marginRight: 7 }} />Nuevas órdenes</h2><p className="pc-muted" style={{ margin: '5px 0 0' }}>Todos los empleados activos reciben estas órdenes. El primero que la acepta la gestiona.</p></div><strong style={{ color: '#171717' }}>{ordenesDisponibles.length} disponibles</strong></div>
          {ordenesDisponibles.length === 0 ? <div className="pc-muted" style={{ padding: '20px 0' }}>No hay órdenes nuevas disponibles en este momento.</div> : <div style={{ display: 'grid', gap: 12 }}>{ordenesDisponibles.map((orden) => <article key={orden.id} className="pc-card" style={{ padding: 16, border: '1px solid rgba(0,0,0,.08)' }}><div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}><div><strong style={{ color: '#171717' }}>{orden.numero_orden || `Orden #${orden.id}`}</strong><p style={{ margin: '5px 0', color: '#171717' }}>{orden.nombre_cliente} {orden.apellido_cliente} · {orden.ciudad_envío}</p><p className="pc-muted" style={{ margin: 0 }}>{orden.dirección_envío}</p>{orden.referencia && <p className="pc-muted" style={{ margin: '5px 0 0' }}>Referencia: {orden.referencia}</p>}</div><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><strong style={{ color: '#171717' }}>L {Number(orden.total || 0).toFixed(2)}</strong><button type="button" className="pc-btn pc-btn-primary" disabled={aceptando !== null || metricas.activas >= maxOrdenes} onClick={() => aceptarOrden(orden.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}><CheckCircle2 size={17} />{aceptando === orden.id ? 'Aceptando...' : metricas.activas >= maxOrdenes ? 'Límite alcanzado' : 'Aceptar orden'}</button></div></div></article>)}</div>}
        </section>
        <h2 className="pc-section-title" style={{ color: '#171717' }}>Gestión</h2>
        <div className="pc-admin-grid">{opciones.map(({ icono: Icono, titulo, ruta }) => <Link key={ruta} to={ruta} className="pc-card pc-admin-option"><div className="pc-admin-option-icon"><Icono size={30} strokeWidth={2} /></div><h3 style={{ color: '#171717' }}>{titulo}</h3><p style={{ color: '#171717' }}>Abrir módulo de {titulo.toLowerCase()}.</p></Link>)}</div>
      </div>
    </main>
  )
}
