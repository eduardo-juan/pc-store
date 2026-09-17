import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx-js-style'
import { supabase } from '../../supabaseClient'
import {
  BarChart3,
  CalendarDays,
  Download,
  RefreshCw,
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import BotonAtras from '../../components/BotonAtras'

const ESTADOS_CONFIRMADOS = [
  'pagada',
  'enviada',
  'entregada',
  'completada',
]

const REGISTROS_POR_PAGINA = 10

const obtenerFechaLocal = (fecha) => {
  const d = new Date(fecha)

  return `${d.getFullYear()}-${String(
    d.getMonth() + 1,
  ).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

const formatearFecha = (fecha) => {
  if (!fecha) return ''

  const [anio, mes, dia] = fecha.split('-')

  return `${dia}/${mes}/${anio}`
}

const formatearMes = (fecha) => {
  const [anio, mes] = fecha.split('-')

  const meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]

  return `${meses[Number(mes) - 1]} ${anio}`
}

const obtenerMesActual = () => {
  const ahora = new Date()

  return `${ahora.getFullYear()}-${String(
    ahora.getMonth() + 1,
  ).padStart(2, '0')}`
}

const cambiarMes = (mes, cantidad) => {
  const [anio, numeroMes] = mes.split('-').map(Number)

  const fecha = new Date(
    anio,
    numeroMes - 1 + cantidad,
    1,
  )

  return `${fecha.getFullYear()}-${String(
    fecha.getMonth() + 1,
  ).padStart(2, '0')}`
}

const obtenerRangoMes = (mes) => {
  const [anio, numeroMes] = mes.split('-').map(Number)

  const inicio = new Date(
    anio,
    numeroMes - 1,
    1,
    0,
    0,
    0,
    0,
  )

  const fin = new Date(
    anio,
    numeroMes,
    0,
    23,
    59,
    59,
    999,
  )

  return {
    inicioISO: inicio.toISOString(),
    finISO: fin.toISOString(),
  }
}

const estiloFiltro = {
  width: 230,
  height: 40,
  boxSizing: 'border-box',
  padding: '0 12px 0 36px',
  border: '1px solid #d4d4d4',
  borderRadius: 9,
  background: '#fff',
  color: '#171717',
  fontSize: 14,
  outline: 'none',
}

const estiloNumero = {
  width: 140,
  height: 40,
  boxSizing: 'border-box',
  padding: '0 12px',
  border: '1px solid #d4d4d4',
  borderRadius: 9,
  background: '#fff',
  color: '#171717',
  fontSize: 14,
  outline: 'none',
}

const ContenedorBusqueda = ({ children }) => (
  <div
    style={{
      position: 'relative',
      flexShrink: 0,
    }}
  >
    <Search
      size={16}
      style={{
        position: 'absolute',
        left: 11,
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#737373',
        pointerEvents: 'none',
      }}
    />
    {children}
  </div>
)

export default function Reportes() {
  const [mesSeleccionado, setMesSeleccionado] =
    useState(obtenerMesActual())

  const [ordenes, setOrdenes] = useState([])
  const [productosVendidos, setProductosVendidos] =
    useState([])
  const [clientes, setClientes] = useState([])
  const [stockCritico, setStockCritico] = useState([])

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [filtroVentas, setFiltroVentas] = useState('')
  const [filtroProductos, setFiltroProductos] =
    useState('')
  const [filtroClientes, setFiltroClientes] =
    useState('')
  const [filtroStock, setFiltroStock] = useState('')
  const [stockMaximo, setStockMaximo] = useState('3')

  const [paginaVentas, setPaginaVentas] = useState(1)
  const [paginaProductos, setPaginaProductos] =
    useState(1)
  const [paginaClientes, setPaginaClientes] =
    useState(1)
  const [paginaStock, setPaginaStock] = useState(1)

  const cargarReportes = async () => {
    setCargando(true)
    setError('')

    try {
      const { inicioISO, finISO } =
        obtenerRangoMes(mesSeleccionado)

      const [
        resultadoOrdenes,
        resultadoProductos,
        resultadoClientes,
        resultadoStock,
      ] = await Promise.all([
        supabase
          .from('ordenes')
          .select(`
            id,
            numero_orden,
            usuario_id,
            total,
            estado,
            created_at
          `)
          .in('estado', ESTADOS_CONFIRMADOS)
          .gte('created_at', inicioISO)
          .lte('created_at', finISO)
          .order('created_at', {
            ascending: false,
          }),

        supabase.rpc(
          'reporte_productos_vendidos_por_periodo',
          {
            p_inicio: inicioISO,
            p_fin: finISO,
          },
        ),

        supabase.rpc(
          'reporte_clientes_por_periodo',
          {
            p_inicio: inicioISO,
            p_fin: finISO,
          },
        ),

        supabase
          .from('productos')
          .select(`
            id,
            nombre,
            stock,
            activo
          `)
          .eq('activo', true)
          .lte('stock', Number(stockMaximo || 3))
          .order('stock', {
            ascending: true,
          })
          .order('nombre', {
            ascending: true,
          }),
      ])

      if (resultadoOrdenes.error)
        throw resultadoOrdenes.error

      if (resultadoProductos.error)
        throw resultadoProductos.error

      if (resultadoClientes.error)
        throw resultadoClientes.error

      if (resultadoStock.error)
        throw resultadoStock.error

      setOrdenes(resultadoOrdenes.data || [])
      setProductosVendidos(
        resultadoProductos.data || [],
      )
      setClientes(resultadoClientes.data || [])
      setStockCritico(resultadoStock.data || [])

      setPaginaVentas(1)
      setPaginaProductos(1)
      setPaginaClientes(1)
      setPaginaStock(1)
    } catch (err) {
      console.error(err)

      setError(
        err?.message ||
          'No se pudieron cargar los reportes.',
      )

      setOrdenes([])
      setProductosVendidos([])
      setClientes([])
      setStockCritico([])
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarReportes()
  }, [mesSeleccionado])

  // =========================
  // VENTAS POR DÍA
  // =========================

  const resumenPorDia = useMemo(() => {
    const resumen = {}

    ordenes.forEach((orden) => {
      const fecha = obtenerFechaLocal(
        orden.created_at,
      )

      if (!resumen[fecha]) {
        resumen[fecha] = {
          fecha,
          cantidad: 0,
          total: 0,
        }
      }

      resumen[fecha].cantidad += 1
      resumen[fecha].total += Number(
        orden.total || 0,
      )
    })

    return Object.values(resumen).sort(
      (a, b) =>
        new Date(b.fecha) -
        new Date(a.fecha),
    )
  }, [ordenes])

  const ventasFiltradas = useMemo(() => {
    const filtro = filtroVentas
      .trim()
      .toLowerCase()

    if (!filtro) return resumenPorDia

    return resumenPorDia.filter((dia) =>
      `${dia.fecha} ${formatearFecha(
        dia.fecha,
      )}`
        .toLowerCase()
        .includes(filtro),
    )
  }, [resumenPorDia, filtroVentas])

  // =========================
  // PRODUCTOS
  // =========================

  const productosFiltrados = useMemo(() => {
    const filtro = filtroProductos
      .trim()
      .toLowerCase()

    return productosVendidos
      .slice()
      .sort(
        (a, b) =>
          Number(b.unidades_vendidas || 0) -
          Number(a.unidades_vendidas || 0),
      )
      .filter((producto) =>
        String(producto.producto_nombre || '')
          .toLowerCase()
          .includes(filtro),
      )
  }, [productosVendidos, filtroProductos])

  // =========================
  // CLIENTES POR NOMBRE
  // =========================

  const clientesFiltrados = useMemo(() => {
    const filtro = filtroClientes
      .trim()
      .toLowerCase()

    return clientes
      .slice()
      .sort(
        (a, b) =>
          Number(b.total_comprado || 0) -
          Number(a.total_comprado || 0),
      )
      .filter((cliente) =>
        `${cliente.nombre || ''} ${
          cliente.apellido || ''
        }`
          .toLowerCase()
          .includes(filtro),
      )
  }, [clientes, filtroClientes])

  // =========================
  // STOCK
  // =========================

  const stockFiltrado = useMemo(() => {
    const filtro = filtroStock
      .trim()
      .toLowerCase()

    const maximo =
      stockMaximo === ''
        ? Infinity
        : Number(stockMaximo)

    return stockCritico.filter((producto) => {
      const coincideNombre = String(
        producto.nombre || '',
      )
        .toLowerCase()
        .includes(filtro)

      const coincideStock =
        Number(producto.stock || 0) <= maximo

      return coincideNombre && coincideStock
    })
  }, [
    stockCritico,
    filtroStock,
    stockMaximo,
  ])

  // =========================
  // PAGINACIÓN
  // =========================

  const totalPaginasVentas = Math.max(
    1,
    Math.ceil(
      ventasFiltradas.length /
        REGISTROS_POR_PAGINA,
    ),
  )

  const ventasPaginadas = ventasFiltradas.slice(
    (paginaVentas - 1) *
      REGISTROS_POR_PAGINA,
    paginaVentas * REGISTROS_POR_PAGINA,
  )

  const totalPaginasProductos = Math.max(
    1,
    Math.ceil(
      productosFiltrados.length /
        REGISTROS_POR_PAGINA,
    ),
  )

  const productosPaginados =
    productosFiltrados.slice(
      (paginaProductos - 1) *
        REGISTROS_POR_PAGINA,
      paginaProductos * REGISTROS_POR_PAGINA,
    )

  const totalPaginasClientes = Math.max(
    1,
    Math.ceil(
      clientesFiltrados.length /
        REGISTROS_POR_PAGINA,
    ),
  )

  const clientesPaginados =
    clientesFiltrados.slice(
      (paginaClientes - 1) *
        REGISTROS_POR_PAGINA,
      paginaClientes * REGISTROS_POR_PAGINA,
    )

  const totalPaginasStock = Math.max(
    1,
    Math.ceil(
      stockFiltrado.length /
        REGISTROS_POR_PAGINA,
    ),
  )

  const stockPaginado = stockFiltrado.slice(
    (paginaStock - 1) *
      REGISTROS_POR_PAGINA,
    paginaStock * REGISTROS_POR_PAGINA,
  )

  // =========================
  // KPIs
  // =========================

  const totalVentas = useMemo(
    () =>
      ordenes.reduce(
        (total, orden) =>
          total + Number(orden.total || 0),
        0,
      ),
    [ordenes],
  )

  const cantidadOrdenes = ordenes.length

  const ticketPromedio =
    cantidadOrdenes > 0
      ? totalVentas / cantidadOrdenes
      : 0

  // =========================
  // EXCEL
  // =========================

  const exportarExcel = () => {
    const wb = XLSX.utils.book_new()

    const negro = '171717'
    const gris = 'E5E5E5'
    const blanco = 'FFFFFF'

    const titulo = {
      font: {
        bold: true,
        color: blanco,
        sz: 16,
      },
      fill: {
        fgColor: { rgb: negro },
      },
    }

    const encabezado = {
      font: {
        bold: true,
        color: blanco,
      },
      fill: {
        fgColor: { rgb: negro },
      },
      alignment: {
        horizontal: 'center',
      },
    }

    const moneda = {
      numFmt: '"L" #,##0.00',
    }

    // RESUMEN

    const datosResumen = [
      ['PC STORE — REPORTE COMERCIAL'],
      [`Mes: ${formatearMes(`${mesSeleccionado}-01`)}`],
      [],
      ['INDICADORES'],
      ['Ventas confirmadas', totalVentas],
      ['Órdenes confirmadas', cantidadOrdenes],
      ['Ticket promedio', ticketPromedio],
      [],
      ['VENTAS POR DÍA'],
      ['Fecha', 'Órdenes', 'Total vendido'],
      ...ventasFiltradas.map((dia) => [
        formatearFecha(dia.fecha),
        dia.cantidad,
        dia.total,
      ]),
    ]

    const wsResumen =
      XLSX.utils.aoa_to_sheet(datosResumen)

    wsResumen['A1'].s = titulo
    wsResumen['A4'].s = titulo
    wsResumen['A9'].s = titulo

    ;['A10', 'B10', 'C10'].forEach(
      (celda) => {
        wsResumen[celda].s = encabezado
      },
    )

    if (wsResumen.B5)
      wsResumen.B5.s = moneda

    if (wsResumen.B7)
      wsResumen.B7.s = moneda

    ventasFiltradas.forEach((_, index) => {
      const fila = 11 + index

      if (wsResumen[`C${fila}`])
        wsResumen[`C${fila}`].s = moneda
    })

    wsResumen['!cols'] = [
      { wch: 30 },
      { wch: 20 },
      { wch: 22 },
    ]

    XLSX.utils.book_append_sheet(
      wb,
      wsResumen,
      'Resumen',
    )

    // PRODUCTOS

    const datosProductos = [
      ['PRODUCTOS MÁS VENDIDOS'],
      [`Mes: ${formatearMes(`${mesSeleccionado}-01`)}`],
      [],
      [
        'Producto',
        'Unidades vendidas',
        'Total vendido',
      ],
      ...productosFiltrados.map((producto) => [
        producto.producto_nombre,
        Number(producto.unidades_vendidas || 0),
        Number(producto.total_vendido || 0),
      ]),
    ]

    const wsProductos =
      XLSX.utils.aoa_to_sheet(datosProductos)

    wsProductos['A1'].s = titulo

    ;['A4', 'B4', 'C4'].forEach(
      (celda) => {
        wsProductos[celda].s = encabezado
      },
    )

    productosFiltrados.forEach((_, index) => {
      const fila = 5 + index

      if (wsProductos[`C${fila}`])
        wsProductos[`C${fila}`].s = moneda
    })

    wsProductos['!cols'] = [
      { wch: 42 },
      { wch: 22 },
      { wch: 22 },
    ]

    XLSX.utils.book_append_sheet(
      wb,
      wsProductos,
      'Productos',
    )

    // CLIENTES

    const datosClientes = [
      ['CLIENTES FRECUENTES'],
      [`Mes: ${formatearMes(`${mesSeleccionado}-01`)}`],
      [],
      [
        'Nombre',
        'Email',
        'Órdenes',
        'Total comprado',
        'Ticket promedio',
      ],
      ...clientesFiltrados.map((cliente) => [
        `${cliente.nombre || ''} ${
          cliente.apellido || ''
        }`.trim(),
        cliente.email || '',
        Number(cliente.cantidad_ordenes || 0),
        Number(cliente.total_comprado || 0),
        Number(cliente.ticket_promedio || 0),
      ]),
    ]

    const wsClientes =
      XLSX.utils.aoa_to_sheet(datosClientes)

    wsClientes['A1'].s = titulo

    ;['A4', 'B4', 'C4', 'D4', 'E4'].forEach(
      (celda) => {
        wsClientes[celda].s = encabezado
      },
    )

    clientesFiltrados.forEach((_, index) => {
      const fila = 5 + index

      if (wsClientes[`D${fila}`])
        wsClientes[`D${fila}`].s = moneda

      if (wsClientes[`E${fila}`])
        wsClientes[`E${fila}`].s = moneda
    })

    wsClientes['!cols'] = [
      { wch: 30 },
      { wch: 38 },
      { wch: 15 },
      { wch: 22 },
      { wch: 22 },
    ]

    XLSX.utils.book_append_sheet(
      wb,
      wsClientes,
      'Clientes',
    )

    // STOCK

    const datosStock = [
      ['PRODUCTOS CON STOCK CRÍTICO'],
      [`Stock máximo: ${stockMaximo || 'Sin límite'}`],
      [],
      ['Producto', 'Stock actual', 'Activo'],
      ...stockFiltrado.map((producto) => [
        producto.nombre,
        Number(producto.stock || 0),
        producto.activo ? 'Sí' : 'No',
      ]),
    ]

    const wsStock =
      XLSX.utils.aoa_to_sheet(datosStock)

    wsStock['A1'].s = titulo

    ;['A4', 'B4', 'C4'].forEach(
      (celda) => {
        wsStock[celda].s = encabezado
      },
    )

    wsStock['!cols'] = [
      { wch: 42 },
      { wch: 18 },
      { wch: 15 },
    ]

    XLSX.utils.book_append_sheet(
      wb,
      wsStock,
      'Stock crítico',
    )

    const fechaArchivo = new Date()
      .toISOString()
      .slice(0, 10)

    XLSX.writeFile(
      wb,
      `PC_Store_Reporte_${mesSeleccionado}_${fechaArchivo}.xlsx`,
    )
  }

  // =========================
  // PAGINACIÓN
  // =========================

  const Paginacion = ({
    pagina,
    totalPaginas,
    totalResultados,
    onAnterior,
    onSiguiente,
  }) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 14,
        borderTop:
          '1px solid rgba(0,0,0,0.08)',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontSize: 14 }}>
        {totalResultados} resultado
        {totalResultados === 1 ? '' : 's'}
      </span>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <button
          type="button"
          className="pc-btn pc-btn-light"
          onClick={onAnterior}
          disabled={pagina <= 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        <strong
          style={{
            minWidth: 100,
            textAlign: 'center',
            fontSize: 14,
          }}
        >
          {pagina} / {totalPaginas}
        </strong>

        <button
          type="button"
          className="pc-btn pc-btn-light"
          onClick={onSiguiente}
          disabled={pagina >= totalPaginas}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          Siguiente
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />

        <div className="pc-admin-header">
          <h1>Reportes comerciales</h1>

          <p>
            Analítica de ventas, productos,
            clientes y stock.
          </p>
        </div>

        {/* SELECTOR DE MES */}

        <div
          className="pc-card"
          style={{
            padding: 18,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <CalendarDays size={21} />

              <div>
                <strong
                  style={{
                    display: 'block',
                    fontSize: 16,
                  }}
                >
                  Período del reporte
                </strong>

                <span
                  style={{
                    color: '#737373',
                    fontSize: 13,
                  }}
                >
                  Selecciona el mes que deseas
                  consultar.
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <button
                type="button"
                className="pc-btn pc-btn-light"
                onClick={() =>
                  setMesSeleccionado(
                    cambiarMes(
                      mesSeleccionado,
                      -1,
                    ),
                  )
                }
                title="Mes anterior"
              >
                <ChevronLeft size={18} />
              </button>

              <input
                type="month"
                value={mesSeleccionado}
                onChange={(e) =>
                  setMesSeleccionado(
                    e.target.value,
                  )
                }
                style={{
                  height: 40,
                  padding: '0 12px',
                  border:
                    '1px solid #d4d4d4',
                  borderRadius: 9,
                  background: '#fff',
                  fontSize: 14,
                  color: '#171717',
                }}
              />

              <button
                type="button"
                className="pc-btn pc-btn-light"
                onClick={() =>
                  setMesSeleccionado(
                    cambiarMes(
                      mesSeleccionado,
                      1,
                    ),
                  )
                }
                title="Mes siguiente"
              >
                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                className="pc-btn pc-btn-light"
                onClick={() =>
                  setMesSeleccionado(
                    obtenerMesActual(),
                  )
                }
              >
                Mes actual
              </button>

              <button
                type="button"
                className="pc-btn pc-btn-primary"
                onClick={cargarReportes}
                disabled={cargando}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <RefreshCw size={17} />
                Actualizar
              </button>

              <button
                type="button"
                className="pc-btn pc-btn-light"
                onClick={exportarExcel}
                disabled={cargando}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <Download size={17} />
                Excel
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              paddingTop: 14,
              borderTop:
                '1px solid rgba(0,0,0,0.08)',
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {formatearMes(
              `${mesSeleccionado}-01`,
            )}
          </div>
        </div>

        {error && (
          <div
            className="pc-alert pc-alert-error"
            style={{ marginBottom: 20 }}
          >
            {error}
          </div>
        )}

        {cargando ? (
          <div
            className="pc-card"
            style={{ padding: 20 }}
          >
            Cargando reportes...
          </div>
        ) : (
          <>
            {/* KPIs */}

            <div
              className="pc-metrics-grid"
              style={{ marginBottom: 24 }}
            >
              <article className="pc-card pc-metric">
                <DollarSign size={20} />

                <span>Ventas confirmadas</span>

                <strong>
                  L {totalVentas.toFixed(2)}
                </strong>
              </article>

              <article className="pc-card pc-metric">
                <ShoppingCart size={20} />

                <span>Órdenes confirmadas</span>

                <strong>
                  {cantidadOrdenes}
                </strong>
              </article>

              <article className="pc-card pc-metric">
                <BarChart3 size={20} />

                <span>Ticket promedio</span>

                <strong>
                  L {ticketPromedio.toFixed(2)}
                </strong>
              </article>

              <article className="pc-card pc-metric">
                <AlertTriangle size={20} />

                <span>Stock crítico</span>

                <strong>
                  {stockCritico.length}
                </strong>
              </article>
            </div>

            {/* VENTAS */}

            <section
              className="pc-card"
              style={{ marginBottom: 24 }}
            >
              <div
                style={{
                  padding: 16,
                  borderBottom:
                    '1px solid rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <CalendarDays size={20} />

                <h2
                  style={{
                    margin: 0,
                    flex: 1,
                  }}
                >
                  Ventas por día
                </h2>

                <ContenedorBusqueda>
                  <input
                    type="search"
                    placeholder="Buscar fecha..."
                    value={filtroVentas}
                    onChange={(e) => {
                      setFiltroVentas(
                        e.target.value,
                      )
                      setPaginaVentas(1)
                    }}
                    style={estiloFiltro}
                  />
                </ContenedorBusqueda>
              </div>

              <div className="pc-table-wrapper">
                <table className="pc-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Órdenes</th>
                      <th>Total vendido</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ventasPaginadas.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          style={{
                            textAlign: 'center',
                            padding: 20,
                          }}
                        >
                          No hay ventas en este
                          mes.
                        </td>
                      </tr>
                    ) : (
                      ventasPaginadas.map((dia) => (
                        <tr key={dia.fecha}>
                          <td>
                            {formatearFecha(
                              dia.fecha,
                            )}
                          </td>
                          <td>{dia.cantidad}</td>
                          <td>
                            L{' '}
                            {dia.total.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <Paginacion
                pagina={paginaVentas}
                totalPaginas={
                  totalPaginasVentas
                }
                totalResultados={
                  ventasFiltradas.length
                }
                onAnterior={() =>
                  setPaginaVentas((p) =>
                    Math.max(1, p - 1),
                  )
                }
                onSiguiente={() =>
                  setPaginaVentas((p) =>
                    Math.min(
                      totalPaginasVentas,
                      p + 1,
                    ),
                  )
                }
              />
            </section>

            {/* PRODUCTOS */}

            <section
              className="pc-card"
              style={{ marginBottom: 24 }}
            >
              <div
                style={{
                  padding: 16,
                  borderBottom:
                    '1px solid rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <Package size={20} />

                <h2
                  style={{
                    margin: 0,
                    flex: 1,
                  }}
                >
                  Productos más vendidos
                </h2>

                <ContenedorBusqueda>
                  <input
                    type="search"
                    placeholder="Buscar producto..."
                    value={filtroProductos}
                    onChange={(e) => {
                      setFiltroProductos(
                        e.target.value,
                      )
                      setPaginaProductos(1)
                    }}
                    style={estiloFiltro}
                  />
                </ContenedorBusqueda>
              </div>

              <div className="pc-table-wrapper">
                <table className="pc-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Unidades</th>
                      <th>Total vendido</th>
                    </tr>
                  </thead>

                  <tbody>
                    {productosPaginados.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          style={{
                            textAlign: 'center',
                            padding: 20,
                          }}
                        >
                          No hay productos vendidos
                          en este mes.
                        </td>
                      </tr>
                    ) : (
                      productosPaginados.map(
                        (producto) => (
                          <tr
                            key={
                              producto.producto_id
                            }
                          >
                            <td>
                              {
                                producto.producto_nombre
                              }
                            </td>

                            <td>
                              {
                                producto.unidades_vendidas
                              }
                            </td>

                            <td>
                              L{' '}
                              {Number(
                                producto.total_vendido ||
                                  0,
                              ).toFixed(2)}
                            </td>
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <Paginacion
                pagina={paginaProductos}
                totalPaginas={
                  totalPaginasProductos
                }
                totalResultados={
                  productosFiltrados.length
                }
                onAnterior={() =>
                  setPaginaProductos((p) =>
                    Math.max(1, p - 1),
                  )
                }
                onSiguiente={() =>
                  setPaginaProductos((p) =>
                    Math.min(
                      totalPaginasProductos,
                      p + 1,
                    ),
                  )
                }
              />
            </section>

            {/* CLIENTES */}

            <section
              className="pc-card"
              style={{ marginBottom: 24 }}
            >
              <div
                style={{
                  padding: 16,
                  borderBottom:
                    '1px solid rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <Users size={20} />

                <h2
                  style={{
                    margin: 0,
                    flex: 1,
                  }}
                >
                  Clientes frecuentes
                </h2>

                <ContenedorBusqueda>
                  <input
                    type="search"
                    placeholder="Buscar cliente por nombre..."
                    value={filtroClientes}
                    onChange={(e) => {
                      setFiltroClientes(
                        e.target.value,
                      )
                      setPaginaClientes(1)
                    }}
                    style={{
                      ...estiloFiltro,
                      width: 260,
                    }}
                  />
                </ContenedorBusqueda>
              </div>

              <div className="pc-table-wrapper">
                <table className="pc-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Órdenes</th>
                      <th>Total comprado</th>
                      <th>Ticket promedio</th>
                    </tr>
                  </thead>

                  <tbody>
                    {clientesPaginados.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            textAlign: 'center',
                            padding: 20,
                          }}
                        >
                          No hay clientes con
                          compras en este mes.
                        </td>
                      </tr>
                    ) : (
                      clientesPaginados.map(
                        (cliente) => (
                          <tr
                            key={
                              cliente.usuario_id
                            }
                          >
                            <td>
                              {`${cliente.nombre || ''} ${
                                cliente.apellido || ''
                              }`.trim() ||
                                'Sin nombre'}
                            </td>

                            <td>
                              {cliente.email}
                            </td>

                            <td>
                              {
                                cliente.cantidad_ordenes
                              }
                            </td>

                            <td>
                              L{' '}
                              {Number(
                                cliente.total_comprado ||
                                  0,
                              ).toFixed(2)}
                            </td>

                            <td>
                              L{' '}
                              {Number(
                                cliente.ticket_promedio ||
                                  0,
                              ).toFixed(2)}
                            </td>
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <Paginacion
                pagina={paginaClientes}
                totalPaginas={
                  totalPaginasClientes
                }
                totalResultados={
                  clientesFiltrados.length
                }
                onAnterior={() =>
                  setPaginaClientes((p) =>
                    Math.max(1, p - 1),
                  )
                }
                onSiguiente={() =>
                  setPaginaClientes((p) =>
                    Math.min(
                      totalPaginasClientes,
                      p + 1,
                    ),
                  )
                }
              />
            </section>

            {/* STOCK */}

            <section className="pc-card">
              <div
                style={{
                  padding: 16,
                  borderBottom:
                    '1px solid rgba(0,0,0,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <AlertTriangle size={20} />

                <h2
                  style={{
                    margin: 0,
                    flex: 1,
                  }}
                >
                  Stock crítico
                </h2>

                <ContenedorBusqueda>
                  <input
                    type="search"
                    placeholder="Buscar producto..."
                    value={filtroStock}
                    onChange={(e) => {
                      setFiltroStock(
                        e.target.value,
                      )
                      setPaginaStock(1)
                    }}
                    style={estiloFiltro}
                  />
                </ContenedorBusqueda>

                <input
                  type="number"
                  min="0"
                  placeholder="Stock máximo"
                  value={stockMaximo}
                  onChange={(e) => {
                    setStockMaximo(
                      e.target.value,
                    )
                    setPaginaStock(1)
                  }}
                  style={estiloNumero}
                />
              </div>

              <div className="pc-table-wrapper">
                <table className="pc-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Stock actual</th>
                    </tr>
                  </thead>

                  <tbody>
                    {stockPaginado.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan={2}
                          style={{
                            textAlign: 'center',
                            padding: 20,
                          }}
                        >
                          No hay productos con
                          stock crítico.
                        </td>
                      </tr>
                    ) : (
                      stockPaginado.map(
                        (producto) => (
                          <tr
                            key={producto.id}
                          >
                            <td>
                              {producto.nombre}
                            </td>

                            <td>
                              {producto.stock}
                            </td>
                          </tr>
                        ),
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <Paginacion
                pagina={paginaStock}
                totalPaginas={
                  totalPaginasStock
                }
                totalResultados={
                  stockFiltrado.length
                }
                onAnterior={() =>
                  setPaginaStock((p) =>
                    Math.max(1, p - 1),
                  )
                }
                onSiguiente={() =>
                  setPaginaStock((p) =>
                    Math.min(
                      totalPaginasStock,
                      p + 1,
                    ),
                  )
                }
              />
            </section>
          </>
        )}
      </div>
    </main>
  )
}