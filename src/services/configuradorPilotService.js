import catalogo from '../data/pilot/catalogoExternoNormalizado.json'

export const TIPOS_PILOTO = [
  { key: 'cpu', label: 'Procesador' },
  { key: 'motherboard', label: 'Placa madre' },
  { key: 'ram', label: 'Memoria RAM' },
  { key: 'gpu', label: 'Tarjeta gráfica' },
  { key: 'storage', label: 'Almacenamiento' },
  { key: 'psu', label: 'Fuente de poder' },
  { key: 'case', label: 'Gabinete' },
]

export function obtenerCatalogoPiloto() {
  return TIPOS_PILOTO.reduce((resultado, item) => {
    resultado[item.key] = Array.isArray(catalogo.categorias?.[item.key]) ? catalogo.categorias[item.key] : []
    return resultado
  }, {})
}

const texto = (valor) => String(valor ?? '').trim().toLowerCase()
const numero = (valor) => {
  const n = Number(valor)
  return Number.isFinite(n) ? n : null
}

function listaNormalizada(valor) {
  if (!Array.isArray(valor)) return []
  return valor.map(texto).filter(Boolean)
}

function agregar(detalles, errores, advertencias, componente, relacion, estado, mensaje) {
  detalles.push({ componente, relacion, estado, mensaje })
  if (estado === 'incompatible' && !errores.includes(mensaje)) errores.push(mensaje)
  if (estado === 'advertencia' && !advertencias.includes(mensaje)) advertencias.push(mensaje)
}

export function analizarCompatibilidadPiloto(configuracion = {}) {
  const errores = []
  const advertencias = []
  const detalles = []
  const { cpu, motherboard, ram, gpu, storage, psu, case: caseItem } = configuracion

  if (cpu && motherboard) {
    if (cpu.socket && motherboard.socket) {
      if (texto(cpu.socket) === texto(motherboard.socket)) {
        agregar(detalles, errores, advertencias, 'cpu', 'CPU ↔ Placa madre', 'compatible', 'Socket ' + cpu.socket + ' compatible.')
      } else {
        agregar(detalles, errores, advertencias, 'cpu', 'CPU ↔ Placa madre', 'incompatible', 'CPU ' + cpu.socket + ' y placa madre ' + motherboard.socket + ': sockets incompatibles.')
      }
    } else {
      agregar(detalles, errores, advertencias, 'cpu', 'CPU ↔ Placa madre', 'pendiente', 'Falta información de socket.')
    }

    const chipsets = listaNormalizada(motherboard.chipsets ?? motherboard.chipset)
    const soportados = listaNormalizada(cpu.supported_chipsets ?? cpu.chipsets)
    if (chipsets.length && soportados.length) {
      const chipsetCompatible = chipsets.some((chipset) => soportados.includes(chipset))
      if (chipsetCompatible) {
        agregar(detalles, errores, advertencias, 'cpu', 'CPU ↔ Chipset', 'compatible', 'El chipset de la placa está contemplado por la CPU.')
      } else {
        agregar(detalles, errores, advertencias, 'cpu', 'CPU ↔ Chipset', 'incompatible', 'El chipset de la placa no está entre los chipsets soportados por la CPU.')
      }
    } else {
      agregar(detalles, errores, advertencias, 'cpu', 'CPU ↔ Chipset', 'pendiente', 'Falta información suficiente de chipset.')
    }
  }

  if (ram && motherboard) {
    if (ram.ram_type && motherboard.ram_type) {
      if (texto(ram.ram_type) === texto(motherboard.ram_type)) {
        agregar(detalles, errores, advertencias, 'ram', 'RAM ↔ Placa madre', 'compatible', 'Tipo ' + ram.ram_type + ' compatible.')
      } else {
        agregar(detalles, errores, advertencias, 'ram', 'RAM ↔ Placa madre', 'incompatible', 'RAM ' + ram.ram_type + ' y placa ' + motherboard.ram_type + ': tipos incompatibles.')
      }
    } else {
      agregar(detalles, errores, advertencias, 'ram', 'RAM ↔ Placa madre', 'pendiente', 'Falta información del tipo de memoria.')
    }

    if (ram.capacity_gb != null && motherboard.ram_max_gb != null) {
      if (numero(ram.capacity_gb) <= numero(motherboard.ram_max_gb)) {
        agregar(detalles, errores, advertencias, 'ram', 'Capacidad RAM ↔ Placa madre', 'compatible', ram.capacity_gb + ' GB dentro del máximo soportado.')
      } else {
        agregar(detalles, errores, advertencias, 'ram', 'Capacidad RAM ↔ Placa madre', 'incompatible', ram.capacity_gb + ' GB supera el máximo de ' + motherboard.ram_max_gb + ' GB.')
      }
    }
  }

  if (motherboard && caseItem) {
    const placa = texto(motherboard.form_factor)
    const acepta = listaNormalizada(caseItem.supports_form_factors ?? caseItem.form_factors)
    const gabinete = texto(caseItem.form_factor)

    if (placa && acepta.length) {
      if (acepta.includes(placa)) {
        agregar(detalles, errores, advertencias, 'motherboard', 'Placa madre ↔ Gabinete', 'compatible', 'El gabinete acepta el formato ' + motherboard.form_factor + '.')
      } else {
        agregar(detalles, errores, advertencias, 'motherboard', 'Placa madre ↔ Gabinete', 'incompatible', 'El gabinete no acepta el formato ' + motherboard.form_factor + '.')
      }
    } else if (placa && gabinete) {
      const jerarquia = {
        atx: ['atx', 'micro-atx', 'matx', 'mini-itx', 'itx'],
        'micro-atx': ['micro-atx', 'matx', 'mini-itx', 'itx'],
        matx: ['micro-atx', 'matx', 'mini-itx', 'itx'],
        'mini-itx': ['mini-itx', 'itx'],
        itx: ['mini-itx', 'itx'],
      }
      const compatibles = jerarquia[gabinete] || []
      if (compatibles.includes(placa)) {
        agregar(detalles, errores, advertencias, 'motherboard', 'Placa madre ↔ Gabinete', 'compatible', 'El gabinete ' + caseItem.form_factor + ' acepta el formato ' + motherboard.form_factor + '.')
      } else {
        agregar(detalles, errores, advertencias, 'motherboard', 'Placa madre ↔ Gabinete', 'incompatible', 'El gabinete ' + caseItem.form_factor + ' no acepta el formato ' + motherboard.form_factor + '.')
      }
    } else {
      agregar(detalles, errores, advertencias, 'motherboard', 'Placa madre ↔ Gabinete', 'pendiente', 'Falta información de formato.')
    }
  }

  if (gpu && caseItem) {
    const gpuLength = numero(gpu.length_mm)
    const maxLength = numero(caseItem.max_gpu_length_mm)
    if (gpuLength != null && maxLength != null) {
      if (gpuLength <= maxLength) {
        agregar(detalles, errores, advertencias, 'gpu', 'GPU ↔ Gabinete', 'compatible', gpuLength + ' mm dentro del máximo de ' + maxLength + ' mm.')
      } else {
        agregar(detalles, errores, advertencias, 'gpu', 'GPU ↔ Gabinete', 'incompatible', 'La GPU mide ' + gpuLength + ' mm y el gabinete admite ' + maxLength + ' mm.')
      }
    } else {
      agregar(detalles, errores, advertencias, 'gpu', 'GPU ↔ Gabinete', 'pendiente', 'Faltan dimensiones para verificar la GPU.')
    }
  }

  if (psu && (cpu || gpu)) {
    const cpuW = numero(cpu?.tdp_w ?? cpu?.consumo_w) ?? 0
    const gpuW = numero(gpu?.tgp_w ?? gpu?.consumo_max_w ?? gpu?.consumo_w) ?? 0
    const capacidad = numero(psu.wattage_w ?? psu.capacidad_w)

    if (capacidad != null) {
      const base = cpuW + gpuW + 150
      const requerida = base * 1.2
      if (capacidad < base) {
        agregar(detalles, errores, advertencias, 'psu', 'Fuente ↔ CPU + GPU', 'incompatible', 'La fuente ' + capacidad + ' W no alcanza el mínimo calculado de ' + base + ' W.')
      } else if (capacidad < requerida) {
        agregar(detalles, errores, advertencias, 'psu', 'Fuente ↔ CPU + GPU', 'advertencia', 'La fuente ' + capacidad + ' W alcanza el mínimo, pero el margen de 20% sugiere aproximadamente ' + Math.ceil(requerida) + ' W.')
      } else {
        agregar(detalles, errores, advertencias, 'psu', 'Fuente ↔ CPU + GPU', 'compatible', 'Fuente ' + capacidad + ' W frente a una recomendación aproximada de ' + Math.ceil(requerida) + ' W.')
      }
    } else {
      agregar(detalles, errores, advertencias, 'psu', 'Fuente ↔ CPU + GPU', 'pendiente', 'Falta la capacidad de la fuente.')
    }
  }

  if (storage && motherboard) {
    agregar(detalles, errores, advertencias, 'storage', 'Almacenamiento ↔ Placa madre', 'pendiente', 'El catálogo piloto no conserva suficientes datos de ranuras libres de la placa para confirmar esta relación.')
  }

  return { compatible: errores.length === 0, errores, advertencias, detalles }
}

export function opcionBloqueada(tipo, item, configuracion = {}) {
  const resultado = analizarCompatibilidadPiloto({ ...configuracion, [tipo]: item })
  return resultado.errores.length > 0
}

export function obtenerOpciones(tipo, configuracion = {}) {
  const catalogo = obtenerCatalogoPiloto()
  return (catalogo[tipo] || []).map((item) => ({
    item,
    bloqueada: opcionBloqueada(tipo, item, configuracion),
  }))
}

export function obtenerResumenPiloto(configuracion = {}) {
  const componentes = TIPOS_PILOTO
    .filter(({ key }) => configuracion[key])
    .map(({ key, label }) => ({
      tipo: key,
      etiqueta: label,
      nombre: nombreComponente(configuracion[key]),
    }))

  const cpuW = numero(configuracion.cpu?.tdp_w ?? configuracion.cpu?.consumo_w)
  const gpuW = numero(configuracion.gpu?.tgp_w ?? configuracion.gpu?.consumo_max_w ?? configuracion.gpu?.consumo_w)
  const consumoComponentes = (cpuW ?? 0) + (gpuW ?? 0)
  const consumoEstimado = consumoComponentes + 150
  const psuRecomendada = Math.ceil(consumoEstimado * 1.2)
  const psuSeleccionada = numero(configuracion.psu?.wattage_w ?? configuracion.psu?.capacidad_w)

  return {
    componentes,
    totalComponentes: componentes.length,
    totalComponentesDisponibles: TIPOS_PILOTO.length,
    consumoCpuW: cpuW,
    consumoGpuW: gpuW,
    consumoEstimado,
    psuRecomendada,
    psuSeleccionada,
    margenPsuW: psuSeleccionada != null ? psuSeleccionada - psuRecomendada : null,
    ramGb: numero(configuracion.ram?.capacity_gb),
    almacenamientoGb: numero(configuracion.storage?.capacity_gb),
  }
}

export function nombreComponente(item) {
  return item ? ([item.marca, item.modelo].filter(Boolean).join(' ') || item.id) : 'Componente'
}