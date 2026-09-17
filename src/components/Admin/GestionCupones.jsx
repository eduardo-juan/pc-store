import { useEffect, useState, useRef } from 'react'
import { Plus, Pencil, X, Power, Trash2 } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import BotonAtras from '../BotonAtras'

const inicial = { codigo: '', descripcion: '', tipo: 'porcentaje', valor: '', compra_minima: '0', limite_usos: '', fecha_inicio: '', fecha_fin: '', activo: true }

export default function GestionCupones() {
  const { esAdmin } = useAuth()
  const [cupones, setCupones] = useState([])
  const [form, setForm] = useState(inicial)
  const [editandoId, setEditandoId] = useState(null)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [eliminandoId, setEliminandoId] = useState(null)
  const formularioRef = useRef(null)

  useEffect(() => { cargarCupones() }, [])

  const cargarCupones = async () => {
    setError('')
    const { data, error } = await supabase.from('cupones').select('*').order('created_at', { ascending: false })
    if (error) { setError(error.message); return }
    setCupones(data || [])
  }

  const cambiar = (campo, valor) => setForm((actual) => ({ ...actual, [campo]: valor }))
  const desplazarAlFormulario = () => window.requestAnimationFrame(() => formularioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))

  const guardar = async (e) => {
    e.preventDefault(); setError('')
    if (!esAdmin) { setError('No tienes permiso para gestionar cupones.'); return }
    const codigo = form.codigo.trim().toUpperCase()
    const valor = Number(form.valor)
    const compraMinima = Number(form.compra_minima || 0)
    const limiteUsos = form.limite_usos === '' ? null : Number(form.limite_usos)
    if (!/^[A-Z0-9_-]{3,30}$/.test(codigo)) { setError('El código debe tener entre 3 y 30 caracteres: letras, números, guion o guion bajo.'); return }
    if (!Number.isFinite(valor) || valor <= 0) { setError('El valor del descuento debe ser mayor que 0.'); return }
    if (form.tipo === 'porcentaje' && valor > 100) { setError('El porcentaje no puede superar 100%.'); return }
    if (!Number.isFinite(compraMinima) || compraMinima < 0) { setError('La compra mínima no puede ser negativa.'); return }
    if (limiteUsos !== null && (!Number.isInteger(limiteUsos) || limiteUsos <= 0)) { setError('El límite de usos debe ser un número entero mayor que 0.'); return }
    if (form.fecha_inicio && form.fecha_fin && new Date(form.fecha_fin) < new Date(form.fecha_inicio)) { setError('La fecha final no puede ser anterior a la fecha inicial.'); return }
    const datos = {
      codigo, descripcion: form.descripcion.trim(), tipo: form.tipo, valor, compra_minima: compraMinima, limite_usos: limiteUsos,
      fecha_inicio: form.fecha_inicio ? new Date(form.fecha_inicio).toISOString() : null,
      fecha_fin: form.fecha_fin ? new Date(form.fecha_fin).toISOString() : null,
      activo: form.activo,
    }
    setGuardando(true)
    const resultado = editandoId ? await supabase.from('cupones').update(datos).eq('id', editandoId) : await supabase.from('cupones').insert([datos])
    setGuardando(false)
    if (resultado.error) { setError(resultado.error.message); return }
    limpiar(); await cargarCupones()
  }

  const editar = (cupon) => {
    const formatoFecha = (fecha) => fecha ? new Date(fecha).toISOString().slice(0, 16) : ''
    setEditandoId(cupon.id)
    setForm({ codigo: cupon.codigo || '', descripcion: cupon.descripcion || '', tipo: cupon.tipo || 'porcentaje', valor: cupon.valor ?? '', compra_minima: cupon.compra_minima ?? '0', limite_usos: cupon.limite_usos ?? '', fecha_inicio: formatoFecha(cupon.fecha_inicio), fecha_fin: formatoFecha(cupon.fecha_fin), activo: Boolean(cupon.activo) })
    setError(''); desplazarAlFormulario()
  }

  const cambiarEstado = async (cupon) => {
    if (!esAdmin) { setError('No tienes permiso para gestionar cupones.'); return }
    setError('')
    const { error } = await supabase.from('cupones').update({ activo: !cupon.activo }).eq('id', cupon.id)
    if (error) { setError(error.message); return }
    await cargarCupones()
  }

  const eliminarCupon = async (cupon) => {
    if (!esAdmin) { setError('No tienes permiso para eliminar cupones.'); return }
    if (!window.confirm(`¿Seguro que quieres eliminar el cupón "${cupon.codigo}"? Esta acción no se puede deshacer.`)) return
    setError(''); setEliminandoId(cupon.id)
    const { data, error } = await supabase.rpc('eliminar_cupon_admin', { p_id: cupon.id })
    setEliminandoId(null)
    if (error) { setError(error.message); return }
    if (!data) { setError('No se encontró el cupón para eliminar.'); return }
    if (editandoId === cupon.id) limpiar()
    await cargarCupones()
  }

  const limpiar = () => { setForm(inicial); setEditandoId(null); setError('') }

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />
        <div className="pc-admin-header"><h1>Gestión de Cupones</h1><p>Crea, modifica y activa promociones con código.</p></div>

        <div ref={formularioRef} className="pc-card" style={{ padding: 22, marginBottom: 24, scrollMarginTop: 24 }}>
          <form className="pc-form-grid" onSubmit={guardar}>
            <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#171717' }}>Código del cupón <span style={{ color: '#dc2626' }}>*</span></label><input className="pc-input" placeholder="Ejemplo: VERANO20" maxLength={30} value={form.codigo} onChange={(e) => cambiar('codigo', e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))} required /><small style={{ color: '#666' }}>Código que escribirá el cliente.</small></div>
            <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#171717' }}>Descripción</label><input className="pc-input" placeholder="Ejemplo: Descuento de verano" maxLength={250} value={form.descripcion} onChange={(e) => cambiar('descripcion', e.target.value)} /></div>
            <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#171717' }}>Tipo de descuento</label><select className="pc-input" value={form.tipo} onChange={(e) => cambiar('tipo', e.target.value)}><option value="porcentaje">Porcentaje (%)</option><option value="fijo">Cantidad fija (L)</option></select></div>
            <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#171717' }}>Valor del descuento <span style={{ color: '#dc2626' }}>*</span></label><input className="pc-input" type="number" min="0.01" step="0.01" value={form.valor} onChange={(e) => cambiar('valor', e.target.value)} required /><small style={{ color: '#666' }}>{form.tipo === 'porcentaje' ? 'Porcentaje que se descontará al cliente.' : 'Cantidad en lempiras que se descontará al cliente.'}</small></div>
            <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#171717' }}>Compra mínima para usar el cupón</label><input className="pc-input" type="number" min="0" step="0.01" value={form.compra_minima} onChange={(e) => cambiar('compra_minima', e.target.value)} /><small style={{ color: '#666' }}>Usa 0 si no hay mínimo.</small></div>
            <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#171717' }}>Límite de usos</label><input className="pc-input" type="number" min="1" step="1" value={form.limite_usos} onChange={(e) => cambiar('limite_usos', e.target.value)} /><small style={{ color: '#666' }}>Déjalo vacío para usos ilimitados.</small></div>
            <label>Inicio<input className="pc-input" type="datetime-local" value={form.fecha_inicio} onChange={(e) => cambiar('fecha_inicio', e.target.value)} /></label>
            <label>Fin<input className="pc-input" type="datetime-local" value={form.fecha_fin} onChange={(e) => cambiar('fecha_fin', e.target.value)} /></label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={form.activo} onChange={(e) => cambiar('activo', e.target.checked)} />Cupón activo</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}><button className="pc-btn pc-btn-primary" type="submit" disabled={guardando} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={17} />{guardando ? 'Guardando...' : editandoId ? 'Actualizar' : 'Crear cupón'}</button>{editandoId && <button className="pc-btn pc-btn-light" type="button" onClick={limpiar} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><X size={17} />Cancelar</button>}</div>
          </form>
        </div>

        {error && <div className="pc-card" style={{ padding: 16, marginBottom: 20, color: '#dc2626' }}>{error}</div>}

        <div className="pc-card pc-table-wrapper">
          <table className="pc-table"><thead><tr><th>Código</th><th>Descuento</th><th>Mínimo</th><th>Usos</th><th>Vigencia</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>{cupones.map((cupon) => <tr key={cupon.id}>
              <td><strong>{cupon.codigo}</strong><br /><small>{cupon.descripcion}</small></td>
              <td>{cupon.tipo === 'porcentaje' ? `${cupon.valor}%` : `L ${Number(cupon.valor).toFixed(2)}`}</td>
              <td>L {Number(cupon.compra_minima).toFixed(2)}</td>
              <td>{cupon.usos_actuales} / {cupon.limite_usos ?? '∞'}</td>
              <td>{cupon.fecha_inicio ? new Date(cupon.fecha_inicio).toLocaleDateString() : 'Ahora'} – {cupon.fecha_fin ? new Date(cupon.fecha_fin).toLocaleDateString() : 'Sin fin'}</td>
              <td>{cupon.activo ? 'Activo' : 'Inactivo'}</td>
              <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button className="pc-btn pc-btn-light" onClick={() => editar(cupon)} type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Pencil size={16} />Editar</button>
                <button className="pc-btn pc-btn-light" onClick={() => cambiarEstado(cupon)} type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Power size={16} />{cupon.activo ? 'Desactivar' : 'Activar'}</button>
                <button className="pc-btn pc-btn-light" onClick={() => eliminarCupon(cupon)} type="button" disabled={eliminandoId === cupon.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#dc2626' }}><Trash2 size={16} />{eliminandoId === cupon.id ? 'Eliminando...' : 'Eliminar'}</button>
              </td>
            </tr>)}
            {cupones.length === 0 && <tr><td colSpan="7">No existen cupones.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}