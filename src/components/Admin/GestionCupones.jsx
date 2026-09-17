import { useEffect, useState } from 'react'
import { Plus, Pencil, X, Power } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import BotonAtras from '../../components/BotonAtras'

const inicial = {
  codigo: '',
  descripcion: '',
  tipo: 'porcentaje',
  valor: '',
  compra_minima: '0',
  limite_usos: '',
  fecha_inicio: '',
  fecha_fin: '',
  activo: true,
}

export default function GestionCupones() {
  const { esAdmin } = useAuth()
  const [cupones, setCupones] = useState([])
  const [form, setForm] = useState(inicial)
  const [editandoId, setEditandoId] = useState(null)
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargarCupones() }, [])

  const cargarCupones = async () => {
    setError('')
    const { data, error } = await supabase.from('cupones').select('*').order('created_at', { ascending: false })
    if (error) return setError(error.message)
    setCupones(data || [])
  }

  const cambiar = (campo, valor) => setForm((actual) => ({ ...actual, [campo]: valor }))

  const guardar = async (e) => {
    e.preventDefault()
    setError('')
    if (!esAdmin) return setError('No tienes permiso para gestionar cupones.')

    const codigo = form.codigo.trim().toUpperCase()
    const valor = Number(form.valor)
    const compraMinima = Number(form.compra_minima || 0)
    const limiteUsos = form.limite_usos === '' ? null : Number(form.limite_usos)

    if (!/^[A-Z0-9_-]{3,30}$/.test(codigo)) return setError('El código debe tener entre 3 y 30 caracteres: letras, números, guion o guion bajo.')
    if (!Number.isFinite(valor) || valor <= 0) return setError('El valor debe ser mayor que 0.')
    if (form.tipo === 'porcentaje' && valor > 100) return setError('El porcentaje no puede superar 100%.')
    if (!Number.isFinite(compraMinima) || compraMinima < 0) return setError('La compra mínima no puede ser negativa.')
    if (limiteUsos !== null && (!Number.isInteger(limiteUsos) || limiteUsos <= 0)) return setError('El límite de usos debe ser un número entero mayor que 0.')
    if (form.fecha_inicio && form.fecha_fin && new Date(form.fecha_fin) < new Date(form.fecha_inicio)) return setError('La fecha final no puede ser anterior a la fecha inicial.')

    const datos = {
      codigo,
      descripcion: form.descripcion.trim(),
      tipo: form.tipo,
      valor,
      compra_minima: compraMinima,
      limite_usos: limiteUsos,
      fecha_inicio: form.fecha_inicio ? new Date(form.fecha_inicio).toISOString() : null,
      fecha_fin: form.fecha_fin ? new Date(form.fecha_fin).toISOString() : null,
      activo: form.activo,
    }

    setGuardando(true)
    const resultado = editandoId
      ? await supabase.from('cupones').update(datos).eq('id', editandoId)
      : await supabase.from('cupones').insert([datos])
    setGuardando(false)

    if (resultado.error) return setError(resultado.error.message)
    limpiar()
    await cargarCupones()
  }

  const editar = (cupon) => {
    const formatoFecha = (fecha) => fecha ? new Date(fecha).toISOString().slice(0, 16) : ''
    setEditandoId(cupon.id)
    setForm({
      codigo: cupon.codigo || '',
      descripcion: cupon.descripcion || '',
      tipo: cupon.tipo || 'porcentaje',
      valor: cupon.valor ?? '',
      compra_minima: cupon.compra_minima ?? '0',
      limite_usos: cupon.limite_usos ?? '',
      fecha_inicio: formatoFecha(cupon.fecha_inicio),
      fecha_fin: formatoFecha(cupon.fecha_fin),
      activo: Boolean(cupon.activo),
    })
    setError('')
  }

  const cambiarEstado = async (cupon) => {
    if (!esAdmin) return setError('No tienes permiso para gestionar cupones.')
    setError('')
    const { error } = await supabase.from('cupones').update({ activo: !cupon.activo }).eq('id', cupon.id)
    if (error) return setError(error.message)
    await cargarCupones()
  }

  const limpiar = () => {
    setForm(inicial)
    setEditandoId(null)
  }

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />
        <div className="pc-admin-header">
          <h1>Gestión de Cupones</h1>
          <p>Crea, modifica y activa promociones con código.</p>
        </div>

        <div className="pc-card" style={{ padding: 22, marginBottom: 24 }}>
          <form className="pc-form-grid" onSubmit={guardar}>
            <input className="pc-input" placeholder="Código (ej. VERANO20)" maxLength={30} value={form.codigo} onChange={(e) => cambiar('codigo', e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))} required />
            <input className="pc-input" placeholder="Descripción" maxLength={250} value={form.descripcion} onChange={(e) => cambiar('descripcion', e.target.value)} />
            <select className="pc-input" value={form.tipo} onChange={(e) => cambiar('tipo', e.target.value)}>
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="fijo">Cantidad fija (L)</option>
            </select>
            <input className="pc-input" type="number" min="0.01" step="0.01" placeholder="Valor" value={form.valor} onChange={(e) => cambiar('valor', e.target.value)} required />
            <input className="pc-input" type="number" min="0" step="0.01" placeholder="Compra mínima" value={form.compra_minima} onChange={(e) => cambiar('compra_minima', e.target.value)} />
            <input className="pc-input" type="number" min="1" step="1" placeholder="Límite de usos (vacío = ilimitado)" value={form.limite_usos} onChange={(e) => cambiar('limite_usos', e.target.value)} />
            <label>Inicio<input className="pc-input" type="datetime-local" value={form.fecha_inicio} onChange={(e) => cambiar('fecha_inicio', e.target.value)} /></label>
            <label>Fin<input className="pc-input" type="datetime-local" value={form.fecha_fin} onChange={(e) => cambiar('fecha_fin', e.target.value)} /></label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" checked={form.activo} onChange={(e) => cambiar('activo', e.target.checked)} /> Cupón activo</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="pc-btn pc-btn-primary" type="submit" disabled={guardando} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={17} />{guardando ? 'Guardando...' : editandoId ? 'Actualizar' : 'Crear cupón'}</button>
              {editandoId && <button className="pc-btn pc-btn-light" type="button" onClick={limpiar} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><X size={17} />Cancelar</button>}
            </div>
          </form>
        </div>

        {error && <div className="pc-card" style={{ padding: 16, marginBottom: 20, color: '#dc2626' }}>{error}</div>}

        <div className="pc-card pc-table-wrapper">
          <table className="pc-table">
            <thead><tr><th>Código</th><th>Descuento</th><th>Mínimo</th><th>Usos</th><th>Vigencia</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {cupones.map((cupon) => (
                <tr key={cupon.id}>
                  <td><strong>{cupon.codigo}</strong><br /><small>{cupon.descripcion}</small></td>
                  <td>{cupon.tipo === 'porcentaje' ? `${cupon.valor}%` : `L ${Number(cupon.valor).toFixed(2)}`}</td>
                  <td>L {Number(cupon.compra_minima).toFixed(2)}</td>
                  <td>{cupon.usos_actuales} / {cupon.limite_usos ?? '∞'}</td>
                  <td>{cupon.fecha_inicio ? new Date(cupon.fecha_inicio).toLocaleDateString() : 'Ahora'} – {cupon.fecha_fin ? new Date(cupon.fecha_fin).toLocaleDateString() : 'Sin fin'}</td>
                  <td>{cupon.activo ? 'Activo' : 'Inactivo'}</td>
                  <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button className="pc-btn pc-btn-light" onClick={() => editar(cupon)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Pencil size={16} />Editar</button>
                    <button className="pc-btn pc-btn-light" onClick={() => cambiarEstado(cupon)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Power size={16} />{cupon.activo ? 'Desactivar' : 'Activar'}</button>
                  </td>
                </tr>
              ))}
              {cupones.length === 0 && <tr><td colSpan="7">No existen cupones.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
