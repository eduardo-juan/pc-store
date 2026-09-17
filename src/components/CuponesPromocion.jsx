import { useEffect, useState } from 'react'
import { Copy, Check, Tag, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function CuponesPromocion() {
  const [cupones, setCupones] = useState([])
  const [copiado, setCopiado] = useState(null)

  useEffect(() => {
    const cargarCupones = async () => {
      const { data } = await supabase.rpc('obtener_cupones_activos')
      setCupones(data || [])
    }
    cargarCupones()
  }, [])

  const copiar = async (codigo) => {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(codigo)
      setTimeout(() => setCopiado(null), 1800)
    } catch {
      setCopiado(null)
    }
  }

  if (!cupones.length) return null

  const textoDescuento = (cupon) =>
    cupon.tipo === 'porcentaje'
      ? `${Number(cupon.valor)}% OFF`
      : `L ${Number(cupon.valor).toLocaleString('es-HN')} OFF`

  return (
    <section className="cupones-promocion">
      <div className="cupones-head">
        <div>
          <span className="cupones-eyebrow">OFERTAS PC STORE</span>
          <h2>Descuentos disponibles</h2>
          <p>Usa estos códigos en el checkout y consigue tu descuento.</p>
        </div>
        <div className="cupones-tag"><Tag size={18} /> PROMOCIONES</div>
      </div>

      <div className="cupones-grid">
        {cupones.map((cupon) => (
          <article className="cupon-card" key={cupon.codigo}>
            <div className="cupon-glow" />
            <div className="cupon-main">
              <span className="cupon-descuento">{textoDescuento(cupon)}</span>
              <h3>{cupon.descripcion || 'Cupón de descuento'}</h3>
              {Number(cupon.compra_minima) > 0 && (
                <small>Compra mínima: L {Number(cupon.compra_minima).toLocaleString('es-HN')}</small>
              )}
            </div>
            <div className="cupon-code-row">
              <div className="cupon-code">{cupon.codigo}</div>
              <button type="button" onClick={() => copiar(cupon.codigo)}>
                {copiado === cupon.codigo ? <Check size={17} /> : <Copy size={17} />}
                {copiado === cupon.codigo ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </article>
        ))}
      </div>

      <Link to="/tienda" className="cupones-cta">
        Aprovechar promoción <ArrowRight size={16} />
      </Link>

      <style>{`
        .cupones-promocion{position:relative;padding:70px clamp(22px,8vw,150px);background:#0d0f12;color:#f5f5f5;overflow:hidden;border-top:1px solid #252932;border-bottom:1px solid #252932}
        .cupones-promocion:before{content:'';position:absolute;width:420px;height:420px;right:-180px;top:-220px;border-radius:50%;background:#d4af3712;filter:blur(8px)}
        .cupones-head{position:relative;display:flex;justify-content:space-between;align-items:end;gap:30px;margin-bottom:28px}
        .cupones-eyebrow{font-size:10px;letter-spacing:.22em;color:#d4af37;font-weight:900}
        .cupones-head h2{font-size:clamp(2rem,4vw,4rem);letter-spacing:-.06em;line-height:.95;margin:12px 0}
        .cupones-head p{margin:0;color:#8e96a3;font-size:13px;line-height:1.6}
        .cupones-tag{display:flex;align-items:center;gap:8px;color:#d4af37;border:1px solid #514522;padding:11px 14px;font-size:10px;letter-spacing:.12em;font-weight:900;white-space:nowrap}
        .cupones-grid{position:relative;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
        .cupon-card{position:relative;background:linear-gradient(135deg,#191c21,#111318);border:1px solid #30343c;padding:24px;overflow:hidden;transition:.25s}
        .cupon-card:hover{transform:translateY(-4px);border-color:#d4af37}
        .cupon-glow{position:absolute;width:120px;height:120px;right:-45px;top:-45px;border-radius:50%;border:1px solid #d4af3730;box-shadow:0 0 50px #d4af3715}
        .cupon-main{position:relative}
        .cupon-descuento{display:inline-block;background:#d4af37;color:#111;padding:7px 10px;font-size:12px;font-weight:950;letter-spacing:.05em}
        .cupon-main h3{font-size:18px;margin:18px 0 8px;letter-spacing:-.03em}
        .cupon-main small{color:#8d95a2;font-size:10px}
        .cupon-code-row{display:flex;align-items:center;gap:10px;margin-top:24px;padding-top:18px;border-top:1px dashed #3a3e45}
        .cupon-code{flex:1;background:#0a0c0f;border:1px solid #343941;padding:12px 14px;color:#e3c55e;font-family:monospace;font-size:13px;font-weight:900;letter-spacing:.14em}
        .cupon-code-row button{display:flex;align-items:center;gap:7px;border:1px solid #d4af37;background:transparent;color:#d4af37;padding:11px 13px;font-size:11px;font-weight:900;cursor:pointer}
        .cupon-code-row button:hover{background:#d4af37;color:#111}
        .cupones-cta{position:relative;display:inline-flex;align-items:center;gap:9px;margin-top:25px;color:#d4af37;font-size:12px;font-weight:900;border-bottom:1px solid #d4af37;padding-bottom:5px}
        @media(max-width:700px){.cupones-head{align-items:start;flex-direction:column}.cupones-grid{grid-template-columns:1fr}.cupon-code-row{flex-direction:column;align-items:stretch}.cupon-code-row button{justify-content:center}}
      `}</style>
    </section>
  )
}
