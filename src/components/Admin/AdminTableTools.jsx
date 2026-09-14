import { useEffect } from 'react'

const ADMIN_PATHS = ['/admin/productos', '/admin/inventario', '/admin/categorias', '/admin/ordenes', '/admin/usuarios', '/admin/empleados', '/admin/ventas', '/admin/auditoria']
const PAGE_SIZE = 10

const esRutaAdmin = () => ADMIN_PATHS.some((ruta) => window.location.pathname === ruta)

const textoFecha = (valor) => {
  if (!valor) return null
  const match = String(valor).match(/(\d{4})[-\/]?(\d{2})[-\/]?(\d{2})/)
  if (match) return `${match[1]}-${match[2]}-${match[3]}`
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime()) ? null : fecha.toISOString().slice(0, 10)
}

const tieneColumnaFecha = (table) => Array.from(table.querySelectorAll('thead th')).some((th) => /fecha|hora|cread|actualiz/i.test(th.textContent || ''))

const instalar = (wrapper) => {
  if (wrapper.dataset.adminTools === 'true') return
  const table = wrapper.querySelector('table')
  if (!table) return

  const tbody = table.querySelector('tbody')
  if (!tbody) return
  const filas = Array.from(tbody.querySelectorAll('tr'))
  if (!filas.length) return

  wrapper.dataset.adminTools = 'true'

  const controles = document.createElement('div')
  controles.style.cssText = 'display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:16px 20px;border-bottom:1px solid #e5e5e5;'

  const buscador = document.createElement('input')
  buscador.type = 'search'
  buscador.placeholder = 'Buscar en esta lista...'
  buscador.className = 'pc-input'
  buscador.style.cssText = 'min-width:240px;flex:1;max-width:420px;'

  const fecha = document.createElement('input')
  fecha.type = 'date'
  fecha.className = 'pc-input'
  fecha.title = 'Filtrar por día'
  fecha.style.cssText = 'min-width:170px;'

  const limpiar = document.createElement('button')
  limpiar.type = 'button'
  limpiar.className = 'pc-btn pc-btn-light'
  limpiar.textContent = 'Limpiar filtros'

  const paginacion = document.createElement('div')
  paginacion.style.cssText = 'display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:14px 20px;border-top:1px solid #e5e5e5;'

  const anterior = document.createElement('button')
  anterior.type = 'button'
  anterior.className = 'pc-btn pc-btn-light'
  anterior.textContent = 'Anterior'

  const indicador = document.createElement('span')
  indicador.style.cssText = 'font-size:.9rem;color:#666;min-width:110px;text-align:center;'

  const siguiente = document.createElement('button')
  siguiente.type = 'button'
  siguiente.className = 'pc-btn pc-btn-light'
  siguiente.textContent = 'Siguiente'

  controles.appendChild(buscador)
  if (tieneColumnaFecha(table) && !wrapper.querySelector('input[type="date"]')) {
    controles.appendChild(fecha)
  }
  controles.appendChild(limpiar)
  wrapper.insertBefore(controles, table)

  paginacion.append(anterior, indicador, siguiente)
  wrapper.appendChild(paginacion)

  let pagina = 1

  const aplicar = () => {
    const termino = buscador.value.trim().toLowerCase()
    const dia = fecha.value
    const filtradas = filas.filter((fila) => {
      const coincideTexto = !termino || (fila.textContent || '').toLowerCase().includes(termino)
      let coincideFecha = true
      if (dia) {
        const celdas = Array.from(fila.querySelectorAll('td'))
        const valoresFecha = celdas.map((celda) => textoFecha(celda.textContent)).filter(Boolean)
        coincideFecha = valoresFecha.includes(dia)
      }
      return coincideTexto && coincideFecha
    })

    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE))
    if (pagina > totalPaginas) pagina = totalPaginas
    const inicio = (pagina - 1) * PAGE_SIZE
    const visibles = new Set(filtradas.slice(inicio, inicio + PAGE_SIZE))

    filas.forEach((fila) => {
      fila.style.display = visibles.has(fila) ? '' : 'none'
    })

    indicador.textContent = `Página ${pagina} de ${totalPaginas}`
    anterior.disabled = pagina <= 1
    siguiente.disabled = pagina >= totalPaginas
  }

  buscador.addEventListener('input', () => { pagina = 1; aplicar() })
  fecha.addEventListener('change', () => { pagina = 1; aplicar() })
  limpiar.addEventListener('click', () => {
    buscador.value = ''
    fecha.value = ''
    pagina = 1
    aplicar()
  })
  anterior.addEventListener('click', () => { if (pagina > 1) { pagina -= 1; aplicar() } })
  siguiente.addEventListener('click', () => { pagina += 1; aplicar() })

  aplicar()
}

export default function AdminTableTools() {
  useEffect(() => {
    if (!esRutaAdmin()) return undefined

    const escanear = () => {
      document.querySelectorAll('.pc-table-wrapper').forEach(instalar)
    }

    escanear()
    const observer = new MutationObserver(escanear)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return null
}
