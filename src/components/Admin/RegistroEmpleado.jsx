import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { supabase } from '../../supabaseClient'
import BotonAtras from '../../components/BotonAtras'
import './RegistroEmpleado.css'

const inicial = { nombre: '', apellido: '', dni: '', teléfono: '', dirección: '', ciudad: '', país: 'Honduras', email: '', password: '', rol: 'empleado' }
const formatearTelefono = (v = '') => { const n = String(v).replace(/\D/g, '').slice(0, 8); return n.length > 4 ? `${n.slice(0, 4)}-${n.slice(4)}` : n }
const formatearDni = (v = '') => { const n = String(v).replace(/\D/g, '').slice(0, 13); if (n.length <= 4) return n; if (n.length <= 8) return `${n.slice(0, 4)}-${n.slice(4)}`; return `${n.slice(0, 4)}-${n.slice(4, 8)}-${n.slice(8)}` }

export default function RegistroEmpleado() {
  const navigate = useNavigate()
  const [form, setForm] = useState(inicial)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)

  const cambiar = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }))
    setErrores((prev) => ({ ...prev, [campo]: false }))
    setErrorGeneral('')
  }

  const validar = () => {
    const nuevos = {}
    Object.entries(form).forEach(([campo, valor]) => { if (!String(valor ?? '').trim()) nuevos[campo] = true })
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) nuevos.email = true
    if (form.password && form.password.length < 6) nuevos.password = true
    if (form.teléfono && !/^\d{4}-\d{4}$/.test(form.teléfono)) nuevos.teléfono = true
    if (form.dni && !/^\d{4}-\d{4}-\d{5}$/.test(form.dni)) nuevos.dni = true
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  const guardar = async (e) => {
    e.preventDefault()
    setErrorGeneral('')
    if (!validar()) return
    setGuardando(true)
    try {
      const { data, error } = await supabase.functions.invoke('crear_empleado', { body: { ...form, email: form.email.trim().toLowerCase() } })
      if (error) throw new Error(error.message || 'No se pudo crear el empleado.')
      if (!data?.success) throw new Error(data?.error || 'No se pudo crear el empleado.')
      navigate('/admin/empleados', { replace: true })
    } catch (error) {
      setErrorGeneral(error.message || 'No se pudo crear el empleado.')
    } finally {
      setGuardando(false)
    }
  }

  const clase = (campo) => `pc-input${errores[campo] ? ' pc-empleado-input-error' : ''}`

  const Campo = ({ campo, label, ...props }) => (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', marginBottom: 7, fontWeight: 600, color: errores[campo] ? '#dc2626' : '#171717' }}>
        {label} <span style={{ color: '#dc2626' }}>*</span>
      </span>
      <input {...props} className={clase(campo)} value={form[campo]} onChange={(e) => cambiar(campo, e.target.value)} />
      {errores[campo] && <small style={{ display: 'block', marginTop: 5, color: '#dc2626' }}>Completa este campo.</small>}
    </label>
  )

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />
        <div className="pc-admin-header">
          <h1>Registrar empleado</h1>
          <p>Completa todos los datos para crear la cuenta del empleado.</p>
        </div>

        <form className="pc-card pc-profile-form" onSubmit={guardar} style={{ maxWidth: 900, margin: '0 auto' }}>
          {errorGeneral && <div style={{ padding: 14, marginBottom: 20, border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', borderRadius: 10 }}><strong>Error:</strong> {errorGeneral}</div>}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}><UserPlus size={22} /><h2 style={{ margin: 0 }}>Datos del empleado</h2></div>

          <div className="pc-form-grid">
            <Campo campo="nombre" label="Nombre" type="text" autoComplete="given-name" />
            <Campo campo="apellido" label="Apellido" type="text" autoComplete="family-name" />
            <Campo campo="dni" label="DNI" type="text" inputMode="numeric" maxLength={15} placeholder="0801-1990-12345" />
            <Campo campo="teléfono" label="Teléfono" type="tel" inputMode="numeric" maxLength={9} placeholder="9439-4343" />
            <Campo campo="ciudad" label="Ciudad" type="text" />
            <Campo campo="país" label="País" type="text" />
            <Campo campo="email" label="Correo electrónico" type="email" autoComplete="email" />
            <label style={{ display: 'block' }}>
              <span style={{ display: 'block', marginBottom: 7, fontWeight: 600 }}>Rol <span style={{ color: '#dc2626' }}>*</span></span>
              <select className="pc-input" value={form.rol} onChange={(e) => cambiar('rol', e.target.value)}>
                <option value="empleado">Empleado</option>
              </select>
            </label>
          </div>

          <label style={{ display: 'block', marginTop: 18 }}>
            <span style={{ display: 'block', marginBottom: 7, fontWeight: 600, color: errores.dirección ? '#dc2626' : '#171717' }}>Dirección <span style={{ color: '#dc2626' }}>*</span></span>
            <textarea className={errores.dirección ? 'pc-textarea pc-empleado-textarea-error' : 'pc-textarea'} rows="3" value={form.dirección} onChange={(e) => cambiar('dirección', e.target.value)} />
            {errores.dirección && <small style={{ display: 'block', marginTop: 5, color: '#dc2626' }}>Completa este campo.</small>}
          </label>

          <label style={{ display: 'block', marginTop: 18 }}>
            <span style={{ display: 'block', marginBottom: 7, fontWeight: 600, color: errores.password ? '#dc2626' : '#171717' }}>Contraseña <span style={{ color: '#dc2626' }}>*</span></span>
            <div style={{ position: 'relative' }}>
              <input className={clase('password')} type={mostrarPassword ? 'text' : 'password'} value={form.password} onChange={(e) => cambiar('password', e.target.value)} minLength={6} autoComplete="new-password" style={{ paddingRight: 50 }} />
              <button type="button" onClick={() => setMostrarPassword((v) => !v)} title={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', padding: 6 }}>{mostrarPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
            {errores.password && <small style={{ display: 'block', marginTop: 5, color: '#dc2626' }}>Completa este campo.</small>}
          </label>

          <p style={{ marginTop: 18, color: '#64748b', fontSize: 14 }}>Los campos marcados con <span style={{ color: '#dc2626' }}>*</span> son obligatorios. La contraseña debe tener al menos 6 caracteres.</p>

          <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
            <button type="submit" className="pc-btn pc-btn-primary" disabled={guardando}>{guardando ? 'Creando cuenta...' : 'Crear cuenta de empleado'}</button>
            <button type="button" className="pc-btn pc-btn-light" onClick={() => navigate('/admin/empleados')} disabled={guardando}>Cancelar</button>
          </div>
        </form>
      </div>
    </main>
  )
}
