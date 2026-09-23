import catalogo from '../data/pilot/catalogoExternoNormalizado.json'

export const TIPOS_PILOTO = [
  { key: 'cpu', label: 'Procesador' },
  { key: 'motherboard', label: 'Placa madre' },
  { key: 'ram', label: 'Memoria RAM' },
  { key: 'gpu', label: 'Tarjeta gráfica' },
  { key: 'storage', label: 'Almacenamiento' },
  { key: 'psu', label: 'Fuente de poder' },
  { key: 'case', label: 'Gabinete' },
  { key: 'cooler', label: 'Cooler' },
]

const COOLERS_PC_STORE = [
  { tipo: 'cooler', id: 'pc-store-cooler-16', marca: 'DeepCool', modelo: 'AG400', socket_compatibles: ['AM5', 'LGA1700'], consumo_max_w: 220, fuente: 'PC Store' },
  { tipo: 'cooler', id: 'pc-store-cooler-17', marca: 'Cooler Master', modelo: 'Hyper 212', socket_compatibles: ['AM5', 'LGA1700'], consumo_max_w: 180, fuente: 'PC Store' },
  { tipo: 'cooler', id: 'pc-store-cooler-36', marca: null, modelo: null, nombre: 'Arctic Freezer 7 X', socket_compatibles: ['AM4', 'AM5', 'LGA1700'], consumo_max_w: null, fuente: 'PC Store' },
  { tipo: 'cooler', id: 'pc-store-cooler-37', marca: null, modelo: null, nombre: 'be quiet! Pure Rock 2', socket_compatibles: ['AM4', 'AM5', 'LGA1700'], consumo_max_w: null, fuente: 'PC Store' },
  { tipo: 'cooler', id: 'pc-store-cooler-38', marca: null, modelo: null, nombre: 'Noctua NH-U12S', socket_compatibles: ['AM4', 'AM5', 'LGA1700'], consumo_max_w: null, fuente: 'PC Store' },
  { tipo: 'cooler', id: 'pc-store-cooler-39', marca: null, modelo: null, nombre: 'DeepCool AK620', socket_compatibles: ['AM4', 'AM5', 'LGA1700'], consumo_max_w: null, fuente: 'PC Store' },
  { tipo: 'cooler', id: 'pc-store-cooler-40', marca: null, modelo: null, nombre: 'Cooler Master ML240L', socket_compatibles: ['AM4', 'AM5', 'LGA1700'], consumo_max_w: null, fuente: 'PC Store' },
  { tipo: 'cooler', id: 'pc-store-cooler-41', marca: null, modelo: null, nombre: 'Arctic Liquid Freezer III 240', socket_compatibles: ['AM4', 'AM5', 'LGA1700'], consumo_max_w: null, fuente: 'PC Store' },
]

export function obtenerCatalogoPiloto() {
  return TIPOS_PILOTO.reduce((resultado, item) => {
    resultado[item.key] = item.key === 'cooler' ? COOLERS_PC_STORE : (Array.isArray(catalogo.categorias?.[item.key]) ? catalogo.categorias[item.key] : [])
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

function esNvme(interfaz) {
  return texto(interfaz).includes('nvme')
}

function esSata(interfaz) {
  return texto(interfaz).includes('sata')
}

function ranurasM2(motherboard) {
  return numero(motherboard?.m2_slots ?? motherboard?.m2Slots)
}

function ranurasSata(motherboard) {
  return numero(motherboard?.sata_ports ?? motherboard?.sataPorts)
}

function analizarAlmacenamiento(storage, motherboard, detalles, errores, advertencias) {
  const interfaz = storage?.interfaz ?? storage?.interface
  const m2 = ranurasM2(motherboard)
  const sata = ranurasSata(motherboard)

  if (!interfaz) {
    agregar(detalles, errores, advertencias, 'storage', 'Almacenamiento ↔ Placa madre', 'pendiente', 'Falta información de interfaz del almacenamiento.')
    return
  }

  if (esNvme(interfaz)) {
    if (m2 != null) {
      if (m2 > 0) {
        agregar(detalles, errores, advertencias, 'storage', 'Almacenamiento ↔ Placa madre', 'compatible', 'El almacenamiento NVMe requiere M.2 y la placa declara ' + m2 + ' ranura(s) M.2.')
      } else {
        agregar(detalles, errores, advertencias, 'storage', 'Almacenamiento ↔ Placa madre', 'incompatible', 'El almacenamiento es NVMe, pero la placa declara 0 ranuras M.2.')
      }
    } else {
      agregar(detalles, errores, advertencias, 'storage', 'Almacenamiento ↔ Placa madre', 'pendiente', 'El almacenamiento es NVMe, pero el catálogo normalizado no conserva el número de ranuras M.2 de esta placa.')
    }
    return
  }

  if (esSata(interfaz)) {
    if (sata != null) {
      if (sata > 0) {
        agregar(detalles, errores, advertencias, 'storage', 'Almacenamiento ↔ Placa madre', 'compatible', 'El almacenamiento SATA tiene puertos SATA declarados en la placa.')
      } else {
        agregar(detalles, errores, advertencias, 'storage', 'Almacenamiento ↔ Placa madre', 'incompatible', 'El almacenamiento es SATA, pero la placa declara 0 puertos SATA.')
      }
    } else {
      agregar(detalles, errores, advertencias, 'storage', 'Almacenamiento ↔ Placa madre', 'pendiente', 'El almacenamiento es SATA, pero el catálogo normalizado no conserva los puertos SATA de esta placa.')
    }
    return
  }

  agregar(detalles, errores, advertencias, 'storage', 'Almacenamiento ↔ Placa madre', 'pendiente', 'Interfaz de almacenamiento no reconocida para una validación segura.')
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
    const ramTipo = ram.ram_tipo ?? ram.ram_type
    const motherboardRamTipo = motherboard.ram_tipo ?? motherboard.ram_type
    if (ramTipo && motherboardRamTipo) {
      if (texto(ramTipo) === texto(motherboardRamTipo)) {
        agregar(detalles, errores, advertencias, 'ram', 'RAM ↔ Placa madre', 'compatible', 'Tipo ' + ramTipo + ' compatible.')
      } else {
        agregar(detalles, errores, advertencias, 'ram', 'RAM ↔ Placa madre', 'incompatible', 'RAM ' + ramTipo + ' y placa ' + motherboardRamTipo + ': tipos incompatibles.')
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
    const gpuLength = numero(gpu.length_mm ?? gpu.longitud_mm)
    const maxLength = numero(caseItem.max_gpu_length_mm ?? caseItem.longitud_gpu_max_mm)
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
    analizarAlmacenamiento(storage, motherboard, detalles, errores, advertencias)
  }

  if (cpu && configuracion.cooler) {
    const cooler = configuracion.cooler
    const sockets = listaNormalizada(cooler.socket_compatibles ?? cooler.socket)
    if (cpu.socket && sockets.length) {
      if (sockets.includes(texto(cpu.socket))) {
        agregar(detalles, errores, advertencias, 'cooler', 'CPU ↔ Cooler', 'compatible', 'El cooler soporta el socket ' + cpu.socket + '.')
      } else {
        agregar(detalles, errores, advertencias, 'cooler', 'CPU ↔ Cooler', 'incompatible', 'El cooler no declara soporte para el socket ' + cpu.socket + '.')
      }
    } else {
      agregar(detalles, errores, advertencias, 'cooler', 'CPU ↔ Cooler', 'pendiente', 'Falta información suficiente de socket del cooler.')
    }

    const cpuW = numero(cpu.tdp_w ?? cpu.consumo_w)
    const coolerW = numero(cooler.consumo_max_w)
    if (cpuW != null && coolerW != null) {
      if (coolerW < cpuW) {
        agregar(detalles, errores, advertencias, 'cooler', 'CPU ↔ Capacidad térmica', 'incompatible', 'El cooler declara una capacidad de ' + coolerW + ' W y la CPU consume ' + cpuW + ' W.')
      } else {
        agregar(detalles, errores, advertencias, 'cooler', 'CPU ↔ Capacidad térmica', 'compatible', 'El cooler declara ' + coolerW + ' W para una CPU de ' + cpuW + ' W.')
      }
    } else {
      agregar(detalles, errores, advertencias, 'cooler', 'CPU ↔ Capacidad térmica', 'pendiente', 'No hay datos suficientes para comparar capacidad térmica.')
    }
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