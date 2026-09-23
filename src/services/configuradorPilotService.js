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
const numero = (valor) => { const n = Number(valor); return Number.isFinite(n) ? n : null }

function agregar(detalles, errores, advertencias, componente, relacion, estado, mensaje) {
  detalles.push({ componente, relacion, estado, mensaje })
  if (estado === 'incompatible' && !errores.includes(mensaje)) errores.push(mensaje)
  if (estado === 'advertencia' && !advertencias.includes(mensaje)) advertencias.push(mensaje)
}

export function analizarCompatibilidadPiloto(configuracion = {}) {
  const errores = [], advertencias = [], detalles = []
  const { cpu, motherboard, ram, gpu, storage, psu, case: caseItem } = configuracion

  if (cpu && motherboard) {
    if (cpu.socket && motherboard.socket) {
      if (texto(cpu.socket) === texto(motherboard.socket)) agregar(detalles, errores, advertencias, 'cpu', 'CPU ↔ Placa madre', 'compatible', 'Socket ' + cpu.socket + ' compatible.')
      else agregar(detalles, errores, advertencias, 'cpu', 'CPU ↔ Placa madre', 'incompatible', 'CPU ' + cpu.socket + ' y placa madre ' + motherboard.socket + ': sockets incompatibles.')
    } else agregar(detalles, errores, advertencias, 'cpu', 'CPU ↔ Placa madre', 'pendiente', 'Falta información de socket.')
  }

  if (ram && motherboard) {
    if (ram.ram_type && motherboard.ram_type) {
      if (texto(ram.ram_type) === texto(motherboard.ram_type)) agregar(detalles, errores, advertencias, 'ram', 'RAM ↔ Placa madre', 'compatible', 'Tipo ' + ram.ram_type + ' compatible.')
      else agregar(detalles, errores, advertencias, 'ram', 'RAM ↔ Placa madre', 'incompatible', 'RAM ' + ram.ram_type + ' y placa ' + motherboard.ram_type + ': tipos incompatibles.')
    } else agregar(detalles, errores, advertencias, 'ram', 'RAM ↔ Placa madre', 'pendiente', 'Falta información del tipo de memoria.')
    if (ram.capacity_gb != null && motherboard.ram_max_gb != null) {
      if (numero(ram.capacity_gb) <= numero(motherboard.ram_max_gb)) agregar(detalles, errores, advertencias, 'ram', 'Capacidad RAM ↔ Placa madre', 'compatible', ram.capacity_gb + ' GB dentro del máximo soportado.')
      else agregar(detalles, errores, advertencias, 'ram', 'Capacidad RAM ↔ Placa madre', 'incompatible', ram.capacity_gb + ' GB supera el máximo de ' + motherboard.ram_max_gb + ' GB.')
    }
  }

  if (motherboard && caseItem) {
    const placa = texto(motherboard.form_factor), gabinete = texto(caseItem.form_factor)
    const acepta = gabinete === 'atx' ? ['atx','micro-atx','matx','mini-itx','itx'].some(x => placa.includes(x)) : gabinete.includes('matx') ? (placa.includes('micro') || placa.includes('matx') || placa.includes('mini-itx') || placa === 'itx') : gabinete.includes('itx') ? placa.includes('itx') : false
    if (placa && gabinete) {
      if (acepta) agregar(detalles, errores, advertencias, 'motherboard', 'Placa madre ↔ Gabinete', 'compatible', 'El gabinete ' + caseItem.form_factor + ' acepta el formato ' + motherboard.form_factor + '.')
      else agregar(detalles, errores, advertencias, 'motherboard', 'Placa madre ↔ Gabinete', 'incompatible', 'El gabinete ' + caseItem.form_factor + ' no acepta el formato ' + motherboard.form_factor + '.')
    } else agregar(detalles, errores, advertencias, 'motherboard', 'Placa madre ↔ Gabinete', 'pendiente', 'Falta información de formato.')
  }

  if (gpu && caseItem) {
    const gpuLength = numero(gpu.length_mm), maxLength = numero(caseItem.max_gpu_length_mm)
    if (gpuLength != null && maxLength != null) {
      if (gpuLength <= maxLength) agregar(detalles, errores, advertencias, 'gpu', 'GPU ↔ Gabinete', 'compatible', gpuLength + ' mm dentro del máximo de ' + maxLength + ' mm.')
      else agregar(detalles, errores, advertencias, 'gpu', 'GPU ↔ Gabinete', 'incompatible', 'La GPU mide ' + gpuLength + ' mm y el gabinete admite ' + maxLength + ' mm.')
    } else agregar(detalles, errores, advertencias, 'gpu', 'GPU ↔ Gabinete', 'pendiente', 'Faltan dimensiones para verificar la GPU.')
  }

  if (psu && (cpu || gpu)) {
    const cpuW = numero(cpu?.tdp_w ?? cpu?.consumo_w) ?? 0, gpuW = numero(gpu?.tgp_w ?? gpu?.consumo_max_w) ?? 0, capacidad = numero(psu.wattage_w ?? psu.capacidad_w)
    if (capacidad != null) {
      const base = cpuW + gpuW + 150, requerida = base * 1.2
      if (capacidad < base) agregar(detalles, errores, advertencias, 'psu', 'Fuente ↔ CPU + GPU', 'incompatible', 'La fuente ' + capacidad + ' W no alcanza el mínimo calculado de ' + base + ' W.')
      else if (capacidad < requerida) agregar(detalles, errores, advertencias, 'psu', 'Fuente ↔ CPU + GPU', 'advertencia', 'La fuente ' + capacidad + ' W alcanza el mínimo, pero el margen de 20% sugiere aproximadamente ' + Math.ceil(requerida) + ' W.')
      else agregar(detalles, errores, advertencias, 'psu', 'Fuente ↔ CPU + GPU', 'compatible', 'Fuente ' + capacidad + ' W frente a una recomendación aproximada de ' + Math.ceil(requerida) + ' W.')
    } else agregar(detalles, errores, advertencias, 'psu', 'Fuente ↔ CPU + GPU', 'pendiente', 'Falta la capacidad de la fuente.')
  }

  if (storage && motherboard) agregar(detalles, errores, advertencias, 'storage', 'Almacenamiento ↔ Placa madre', 'pendiente', 'El catálogo piloto no conserva suficientes datos de ranuras libres de la placa para confirmar esta relación.')

  return { compatible: errores.length === 0, errores, advertencias, detalles }
}

export function nombreComponente(item) { return item ? ([item.marca, item.modelo].filter(Boolean).join(' ') || item.id) : 'Componente' }