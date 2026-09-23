function obtenerEspecificaciones(componente) {
  if (!componente) return {}

  return componente.producto?.especificaciones || {}
}

function obtenerValor(componente, campo, valorAlternativo = null) {
  const specs = obtenerEspecificaciones(componente)

  if (
    specs[campo] !== undefined &&
    specs[campo] !== null &&
    specs[campo] !== ''
  ) {
    return specs[campo]
  }

  if (
    componente?.[campo] !== undefined &&
    componente?.[campo] !== null &&
    componente?.[campo] !== ''
  ) {
    return componente[campo]
  }

  return valorAlternativo
}

function normalizarTexto(valor) {
  return String(valor || '')
    .trim()
    .toLowerCase()
}

function obtenerNumero(componente, campo) {
  const valor = obtenerValor(componente, campo)

  if (valor === null || valor === undefined || valor === '') {
    return null
  }

  const numero = Number(valor)

  return Number.isFinite(numero) ? numero : null
}

function obtenerSocketsCompatibles(cooler) {
  const specs = obtenerEspecificaciones(cooler)

  const sockets =
    specs.socket_compatibles ??
    cooler?.socket_compatibles ??
    []

  if (Array.isArray(sockets)) {
    return sockets.map(normalizarTexto)
  }

  if (typeof sockets === 'string') {
    return sockets
      .split(',')
      .map(normalizarTexto)
      .filter(Boolean)
  }

  return []
}

function agregarError(errores, mensaje) {
  if (!errores.includes(mensaje)) {
    errores.push(mensaje)
  }
}

function agregarAdvertencia(advertencias, mensaje) {
  if (!advertencias.includes(mensaje)) {
    advertencias.push(mensaje)
  }
}

function agregarDetalle(
  detalles,
  componente,
  relacion,
  estado,
  mensaje
) {
  detalles.push({
    componente,
    relacion,
    estado,
    mensaje,
  })
}

function agregarCompatible(
  detalles,
  componente,
  relacion,
  mensaje
) {
  agregarDetalle(
    detalles,
    componente,
    relacion,
    'compatible',
    mensaje
  )
}

function agregarPendiente(
  detalles,
  componente,
  relacion,
  mensaje
) {
  agregarDetalle(
    detalles,
    componente,
    relacion,
    'pendiente',
    mensaje
  )
}

function agregarAdvertenciaDetalle(
  detalles,
  advertencias,
  componente,
  relacion,
  mensaje
) {
  agregarAdvertencia(advertencias, mensaje)

  agregarDetalle(
    detalles,
    componente,
    relacion,
    'advertencia',
    mensaje
  )
}

function agregarIncompatibilidad(
  detalles,
  errores,
  componente,
  relacion,
  mensaje
) {
  agregarError(errores, mensaje)

  agregarDetalle(
    detalles,
    componente,
    relacion,
    'incompatible',
    mensaje
  )
}

export function esCompatible(configuracion = {}) {
  /*
   * El Configurador.jsx utiliza estas claves:
   *
   * cpu
   * motherboard
   * ram
   * gpu
   * storage
   * psu
   * case
   * cooler
   *
   * También aceptamos los nombres antiguos para
   * mantener compatibilidad con otros usos.
   */

  const procesador =
    configuracion.cpu ??
    configuracion.procesador ??
    null

  const placa =
    configuracion.motherboard ??
    configuracion.placa ??
    null

  const memoria =
    configuracion.ram ??
    configuracion.memoria ??
    null

  const tarjetaGrafica =
    configuracion.gpu ??
    configuracion.tarjetaGrafica ??
    null

  const almacenamiento =
    configuracion.storage ??
    configuracion.almacenamiento ??
    null

  const fuente =
    configuracion.psu ??
    configuracion.fuente ??
    null

  const gabinete =
    configuracion.case ??
    configuracion.gabinete ??
    null

  const cooler =
    configuracion.cooler ??
    null

  const errores = []
  const advertencias = []
  const detalles = []

  /*
   * ============================================================
   * 1. CPU ↔ PLACA MADRE
   * ============================================================
   */

  if (procesador && placa) {
    const cpuSocket = obtenerValor(
      procesador,
      'socket'
    )

    const placaSocket = obtenerValor(
      placa,
      'socket'
    )

    if (cpuSocket && placaSocket) {
      if (
        normalizarTexto(cpuSocket) ===
        normalizarTexto(placaSocket)
      ) {
        agregarCompatible(
          detalles,
          'cpu',
          'CPU ↔ Placa madre',
          `Socket compatible: ${cpuSocket}.`
        )

        agregarCompatible(
          detalles,
          'motherboard',
          'Placa madre ↔ CPU',
          `La placa madre utiliza ${placaSocket}, compatible con el procesador.`
        )
      } else {
        const mensaje =
          `El procesador utiliza ${cpuSocket} y la placa madre utiliza ${placaSocket}.`

        agregarIncompatibilidad(
          detalles,
          errores,
          'cpu',
          'CPU ↔ Placa madre',
          mensaje
        )

        agregarIncompatibilidad(
          detalles,
          errores,
          'motherboard',
          'Placa madre ↔ CPU',
          mensaje
        )
      }
    } else {
      agregarPendiente(
        detalles,
        'cpu',
        'CPU ↔ Placa madre',
        'No hay suficiente información de socket para verificar esta relación.'
      )

      agregarPendiente(
        detalles,
        'motherboard',
        'Placa madre ↔ CPU',
        'No hay suficiente información de socket para verificar esta relación.'
      )
    }
  }

  /*
   * ============================================================
   * 2. RAM ↔ PLACA MADRE
   * ============================================================
   */

  if (memoria && placa) {
    const ramTipo = obtenerValor(
      memoria,
      'ram_tipo'
    )

    const placaRamTipo = obtenerValor(
      placa,
      'ram_tipo'
    )

    if (ramTipo && placaRamTipo) {
      if (
        normalizarTexto(ramTipo) ===
        normalizarTexto(placaRamTipo)
      ) {
        agregarCompatible(
          detalles,
          'ram',
          'RAM ↔ Placa madre',
          `Tipo de memoria compatible: ${ramTipo}.`
        )

        agregarCompatible(
          detalles,
          'motherboard',
          'Placa madre ↔ RAM',
          `La placa madre soporta ${placaRamTipo}.`
        )
      } else {
        const mensaje =
          `La memoria es ${ramTipo} y la placa madre requiere ${placaRamTipo}.`

        agregarIncompatibilidad(
          detalles,
          errores,
          'ram',
          'RAM ↔ Placa madre',
          mensaje
        )

        agregarIncompatibilidad(
          detalles,
          errores,
          'motherboard',
          'Placa madre ↔ RAM',
          mensaje
        )
      }
    } else {
      agregarPendiente(
        detalles,
        'ram',
        'RAM ↔ Placa madre',
        'No hay suficiente información sobre el tipo de memoria.'
      )
    }

    const ramCapacidad =
      obtenerNumero(
        memoria,
        'capacidad_gb'
      )

    const placaMaxRam =
      obtenerNumero(
        placa,
        'ram_max_gb'
      )

    if (
      ramCapacidad !== null &&
      placaMaxRam !== null
    ) {
      if (
        ramCapacidad <= placaMaxRam
      ) {
        agregarCompatible(
          detalles,
          'ram',
          'Capacidad RAM ↔ Placa madre',
          `${ramCapacidad} GB dentro del máximo soportado de ${placaMaxRam} GB.`
        )
      } else {
        const mensaje =
          `La memoria seleccionada (${ramCapacidad} GB) supera la capacidad máxima de la placa madre (${placaMaxRam} GB).`

        agregarIncompatibilidad(
          detalles,
          errores,
          'ram',
          'Capacidad RAM ↔ Placa madre',
          mensaje
        )

        agregarIncompatibilidad(
          detalles,
          errores,
          'motherboard',
          'Capacidad RAM ↔ Placa madre',
          mensaje
        )
      }
    } else {
      agregarPendiente(
        detalles,
        'ram',
        'Capacidad RAM ↔ Placa madre',
        'No hay suficiente información para comprobar la capacidad máxima de RAM.'
      )
    }
  }

  /*
   * ============================================================
   * 3. PLACA MADRE ↔ GABINETE
   * ============================================================
   */

  if (placa && gabinete) {
    const placaFormFactor =
      obtenerValor(
        placa,
        'form_factor'
      )

    const gabineteFormFactor =
      obtenerValor(
        gabinete,
        'form_factor'
      )

    if (
      placaFormFactor &&
      gabineteFormFactor
    ) {
      const placaFormato =
        normalizarTexto(
          placaFormFactor
        )

      const gabineteFormato =
        normalizarTexto(
          gabineteFormFactor
        )

      const compatibilidadGabinetes = {
        atx: [
          'atx',
          'micro-atx',
          'mini-itx',
        ],

        'micro-atx': [
          'micro-atx',
          'mini-itx',
        ],

        'mini-itx': [
          'mini-itx',
        ],
      }

      const permitidos =
        compatibilidadGabinetes[
          gabineteFormato
        ]

      if (
        permitidos &&
        permitidos.includes(
          placaFormato
        )
      ) {
        agregarCompatible(
          detalles,
          'motherboard',
          'Placa madre ↔ Gabinete',
          `${placaFormFactor} es compatible con un gabinete ${gabineteFormFactor}.`
        )

        agregarCompatible(
          detalles,
          'case',
          'Gabinete ↔ Placa madre',
          `El gabinete admite placas ${placaFormFactor}.`
        )
      } else if (permitidos) {
        const mensaje =
          `La placa madre utiliza formato ${placaFormFactor} y el gabinete es ${gabineteFormFactor}.`

        agregarIncompatibilidad(
          detalles,
          errores,
          'motherboard',
          'Placa madre ↔ Gabinete',
          mensaje
        )

        agregarIncompatibilidad(
          detalles,
          errores,
          'case',
          'Gabinete ↔ Placa madre',
          mensaje
        )
      } else {
        agregarPendiente(
          detalles,
          'motherboard',
          'Placa madre ↔ Gabinete',
          'El formato registrado no permite determinar la compatibilidad.'
        )
      }
    } else {
      agregarPendiente(
        detalles,
        'motherboard',
        'Placa madre ↔ Gabinete',
        'Falta información de formato para verificar esta relación.'
      )
    }
  }

  /*
   * ============================================================
   * 4. GPU ↔ GABINETE
   * ============================================================
   */

  if (
    tarjetaGrafica &&
    gabinete
  ) {
    const gpuLongitud =
      obtenerNumero(
        tarjetaGrafica,
        'longitud_gpu_mm'
      ) ??
      obtenerNumero(
        tarjetaGrafica,
        'longitud_mm'
      )

    const gabineteEspacioGpu =
      obtenerNumero(
        gabinete,
        'longitud_gpu_max_mm'
      ) ??
      obtenerNumero(
        gabinete,
        'longitud_mm'
      )

    if (
      gpuLongitud !== null &&
      gabineteEspacioGpu !== null
    ) {
      if (
        gpuLongitud <=
        gabineteEspacioGpu
      ) {
        agregarCompatible(
          detalles,
          'gpu',
          'GPU ↔ Gabinete',
          `${gpuLongitud} mm dentro del espacio máximo de ${gabineteEspacioGpu} mm.`
        )

        agregarCompatible(
          detalles,
          'case',
          'Gabinete ↔ GPU',
          `El gabinete dispone de ${gabineteEspacioGpu} mm para la GPU.`
        )
      } else {
        const mensaje =
          `La tarjeta gráfica mide ${gpuLongitud} mm y el gabinete admite hasta ${gabineteEspacioGpu} mm.`

        agregarIncompatibilidad(
          detalles,
          errores,
          'gpu',
          'GPU ↔ Gabinete',
          mensaje
        )

        agregarIncompatibilidad(
          detalles,
          errores,
          'case',
          'Gabinete ↔ GPU',
          mensaje
        )
      }
    } else {
      agregarPendiente(
        detalles,
        'gpu',
        'GPU ↔ Gabinete',
        'No hay suficiente información sobre las dimensiones para comprobar esta relación.'
      )
    }
  }

  /*
   * ============================================================
   * 5. GPU ↔ PLACA MADRE
   * ============================================================
   *
   * IMPORTANTE:
   * `interfaz` de una placa madre puede contener M.2/NVMe para
   * almacenamiento. No debe reutilizarse para validar la GPU.
   * Para GPU buscamos únicamente campos explícitos de PCIe.
   * Si la placa no registra ese dato, no la marcamos como
   * advertencia ni incompatibilidad: queda como compatible por
   * ausencia de una contradicción registrada.
   */

  if (
    tarjetaGrafica &&
    placa
  ) {
    const gpuInterfaz =
      obtenerValor(
        tarjetaGrafica,
        'interfaz'
      )

    const gpuTexto = normalizarTexto(gpuInterfaz)

    const specsPlaca = obtenerEspecificaciones(placa)
    const placaInterfazPcie =
      specsPlaca.interfaz_pcie ??
      specsPlaca.interfaz_gpu ??
      specsPlaca.pcie_gpu ??
      specsPlaca.slot_pcie_gpu ??
      placa?.interfaz_pcie ??
      placa?.interfaz_gpu ??
      placa?.pcie_gpu ??
      placa?.slot_pcie_gpu ??
      null

    const placaTexto = normalizarTexto(placaInterfazPcie)

    if (gpuTexto.includes('pci') && placaTexto.includes('pci')) {
      agregarCompatible(
        detalles,
        'gpu',
        'GPU ↔ Placa madre',
        `La GPU utiliza ${gpuInterfaz} y la placa madre registra ${placaInterfazPcie}.`
      )

      agregarCompatible(
        detalles,
        'motherboard',
        'Placa madre ↔ GPU',
        'La interfaz PCIe registrada permite conectar la tarjeta gráfica.'
      )
    } else if (gpuTexto.includes('pci') && !placaInterfazPcie) {
      agregarCompatible(
        detalles,
        'gpu',
        'GPU ↔ Placa madre',
        `La GPU utiliza ${gpuInterfaz}. No hay un dato PCIe específico registrado en la placa madre, pero tampoco existe una incompatibilidad registrada.`
      )
    } else if (gpuInterfaz && placaInterfazPcie) {
      agregarAdvertenciaDetalle(
        detalles,
        advertencias,
        'gpu',
        'GPU ↔ Placa madre',
        `Las interfaces registradas (${gpuInterfaz} / ${placaInterfazPcie}) requieren revisión.`
      )
    } else {
      agregarPendiente(
        detalles,
        'gpu',
        'GPU ↔ Placa madre',
        'No hay suficiente información de interfaz para verificar esta relación.'
      )
    }
  }

  /*
   * ============================================================
   * 6. ALMACENAMIENTO ↔ PLACA MADRE
   * ============================================================
   */

  if (
    almacenamiento &&
    placa
  ) {
    const almacenamientoInterfaz =
      obtenerValor(
        almacenamiento,
        'interfaz'
      )

    const placaInterfaz =
      obtenerValor(
        placa,
        'interfaz'
      )

    if (
      almacenamientoInterfaz &&
      placaInterfaz
    ) {
      const storage =
        normalizarTexto(
          almacenamientoInterfaz
        )

      const placaTexto =
        normalizarTexto(
          placaInterfaz
        )

      const almacenamientoNvme = storage.includes('nvme')
      const almacenamientoM2 = storage.includes('m.2')
      const placaNvme = placaTexto.includes('nvme')
      const placaM2 = placaTexto.includes('m.2')

      if (almacenamientoNvme || almacenamientoM2) {
        if (almacenamientoNvme && placaNvme) {
          agregarCompatible(
            detalles,
            'storage',
            'Almacenamiento ↔ Placa madre',
            `El almacenamiento ${almacenamientoInterfaz} tiene una interfaz compatible.`
          )

          agregarCompatible(
            detalles,
            'motherboard',
            'Placa madre ↔ Almacenamiento',
            'La placa madre dispone de una interfaz NVMe compatible.'
          )
        } else if (almacenamientoNvme && placaM2) {
          agregarAdvertenciaDetalle(
            detalles,
            advertencias,
            'storage',
            'Almacenamiento ↔ Placa madre',
            'La placa madre registra M.2, pero no especifica si admite NVMe; verifica el manual.'
          )
        } else if (!almacenamientoNvme && placaM2 && placaNvme) {
          agregarAdvertenciaDetalle(
            detalles,
            advertencias,
            'storage',
            'Almacenamiento ↔ Placa madre',
            'El almacenamiento M.2 SATA y la placa registra M.2 NVMe; verifica si el puerto también admite SATA.'
          )
        } else if (!almacenamientoNvme && placaM2) {
          agregarCompatible(
            detalles,
            'storage',
            'Almacenamiento ↔ Placa madre',
            `El almacenamiento ${almacenamientoInterfaz} tiene una interfaz M.2 compatible.`
          )
        } else {
          const mensaje = almacenamientoNvme
            ? 'El almacenamiento NVMe requiere una interfaz M.2/NVMe compatible en la placa madre.'
            : 'El almacenamiento M.2 SATA requiere una ranura M.2 en la placa madre.'

          agregarIncompatibilidad(
            detalles,
            errores,
            'storage',
            'Almacenamiento ↔ Placa madre',
            mensaje
          )

          agregarIncompatibilidad(
            detalles,
            errores,
            'motherboard',
            'Placa madre ↔ Almacenamiento',
            mensaje
          )
        }
      } else if (
        storage.includes('sata')
      ) {
        if (
          placaTexto.includes('sata')
        ) {
          agregarCompatible(
            detalles,
            'storage',
            'Almacenamiento ↔ Placa madre',
            'La interfaz SATA está registrada en ambos componentes.'
          )

          agregarCompatible(
            detalles,
            'motherboard',
            'Placa madre ↔ Almacenamiento',
            'La placa madre registra soporte SATA.'
          )
        } else {
          agregarAdvertenciaDetalle(
            detalles,
            advertencias,
            'storage',
            'Almacenamiento ↔ Placa madre',
            'No hay suficiente información para confirmar los puertos SATA.'
          )
        }
      } else {
        agregarPendiente(
          detalles,
          'storage',
          'Almacenamiento ↔ Placa madre',
          'La interfaz registrada no permite determinar completamente la compatibilidad.'
        )
      }
    } else {
      agregarPendiente(
        detalles,
        'storage',
        'Almacenamiento ↔ Placa madre',
        'Falta información de interfaz para verificar esta relación.'
      )
    }
  }

  /*
   * ============================================================
   * 7. CPU ↔ COOLER
   * ============================================================
   */

  if (
    procesador &&
    cooler
  ) {
    const cpuSocket =
      obtenerValor(
        procesador,
        'socket'
      )

    const coolerSockets =
      obtenerSocketsCompatibles(
        cooler
      )

    if (
      cpuSocket &&
      coolerSockets.length > 0
    ) {
      const socketCPU =
        normalizarTexto(
          cpuSocket
        )

      if (
        coolerSockets.includes(
          socketCPU
        )
      ) {
        agregarCompatible(
          detalles,
          'cpu',
          'CPU ↔ Refrigeración',
          `El disipador soporta el socket ${cpuSocket}.`
        )

        agregarCompatible(
          detalles,
          'cooler',
          'Refrigeración ↔ CPU',
          `Socket ${cpuSocket} soportado.`
        )
      } else {
        const mensaje =
          `El disipador no es compatible con el socket ${cpuSocket}.`

        agregarIncompatibilidad(
          detalles,
          errores,
          'cpu',
          'CPU ↔ Refrigeración',
          mensaje
        )

        agregarIncompatibilidad(
          detalles,
          errores,
          'cooler',
          'Refrigeración ↔ CPU',
          mensaje
        )
      }
    } else {
      agregarPendiente(
        detalles,
        'cooler',
        'Refrigeración ↔ CPU',
        'No hay suficiente información de socket para verificar esta relación.'
      )
    }

    const cpuConsumo =
      obtenerNumero(
        procesador,
        'consumo_max_w'
      ) ??
      obtenerNumero(
        procesador,
        'tdp_max_w'
      ) ??
      obtenerNumero(
        procesador,
        'consumo_w'
      )

    const coolerCapacidad =
      obtenerNumero(
        cooler,
        'consumo_max_w'
      ) ??
      obtenerNumero(
        cooler,
        'capacidad_w'
      )

    if (
      cpuConsumo !== null &&
      coolerCapacidad !== null
    ) {
      if (
        coolerCapacidad >=
        cpuConsumo
      ) {
        agregarCompatible(
          detalles,
          'cooler',
          'Capacidad térmica ↔ CPU',
          `El disipador soporta aproximadamente ${coolerCapacidad} W y el procesador registra ${cpuConsumo} W.`
        )
      } else {
        const mensaje =
          `El disipador tiene capacidad de ${coolerCapacidad} W, inferior a los ${cpuConsumo} W del procesador.`

        agregarIncompatibilidad(
          detalles,
          errores,
          'cooler',
          'Capacidad térmica ↔ CPU',
          mensaje
        )
      }
    } else {
      agregarPendiente(
        detalles,
        'cooler',
        'Capacidad térmica ↔ CPU',
        'No hay suficiente información térmica para comprobar esta relación.'
      )
    }
  }

  /*
   * ============================================================
   * 8. CPU + GPU ↔ FUENTE
   * ============================================================
   */

  if (
    fuente &&
    (procesador || tarjetaGrafica)
  ) {
    const cpuConsumo =
      obtenerNumero(
        procesador,
        'consumo_max_w'
      ) ??
      obtenerNumero(
        procesador,
        'tdp_max_w'
      ) ??
      obtenerNumero(
        procesador,
        'consumo_w'
      ) ??
      0

    const gpuConsumo =
      obtenerNumero(
        tarjetaGrafica,
        'consumo_w'
      ) ??
      obtenerNumero(
        tarjetaGrafica,
        'tdp_w'
      ) ??
      0

    const fuenteCapacidad =
      obtenerNumero(
        fuente,
        'capacidad_w'
      )

    if (
      fuenteCapacidad !== null
    ) {
      const consumoEstimado =
        cpuConsumo +
        gpuConsumo +
        100

      const capacidadRecomendada =
        consumoEstimado * 1.25

      if (
        fuenteCapacidad <
        consumoEstimado
      ) {
        const mensaje =
          `La fuente de ${fuenteCapacidad} W no alcanza el consumo estimado de ${consumoEstimado} W.`

        agregarIncompatibilidad(
          detalles,
          errores,
          'psu',
          'Fuente ↔ CPU + GPU',
          mensaje
        )
      } else if (
        fuenteCapacidad <
        capacidadRecomendada
      ) {
        agregarAdvertenciaDetalle(
          detalles,
          advertencias,
          'psu',
          'Fuente ↔ CPU + GPU',
          `La fuente alcanza el consumo estimado (${consumoEstimado} W), pero el margen recomendado sería aproximadamente ${Math.round(capacidadRecomendada)} W.`
        )
      } else {
        agregarCompatible(
          detalles,
          'psu',
          'Fuente ↔ CPU + GPU',
          `Fuente de ${fuenteCapacidad} W frente a un consumo estimado de ${consumoEstimado} W.`
        )
      }
    } else {
      agregarPendiente(
        detalles,
        'psu',
        'Fuente ↔ CPU + GPU',
        'No hay suficiente información sobre la capacidad de la fuente.'
      )
    }
  }

  /*
   * ============================================================
   * 9. GPU ↔ FUENTE
   * ============================================================
   */

  if (
    fuente &&
    tarjetaGrafica
  ) {
    const fuenteCapacidad =
      obtenerNumero(
        fuente,
        'capacidad_w'
      )

    const gpuFuenteRecomendada =
      obtenerNumero(
        tarjetaGrafica,
        'fuente_recomendada_w'
      )

    if (
      fuenteCapacidad !== null &&
      gpuFuenteRecomendada !== null
    ) {
      if (
        fuenteCapacidad >=
        gpuFuenteRecomendada
      ) {
        agregarCompatible(
          detalles,
          'gpu',
          'GPU ↔ Fuente',
          `La GPU recomienda ${gpuFuenteRecomendada} W y la fuente proporciona ${fuenteCapacidad} W.`
        )
      } else {
        const mensaje =
          `La tarjeta gráfica recomienda una fuente de al menos ${gpuFuenteRecomendada} W.`

        agregarIncompatibilidad(
          detalles,
          errores,
          'gpu',
          'GPU ↔ Fuente',
          mensaje
        )

        agregarIncompatibilidad(
          detalles,
          errores,
          'psu',
          'Fuente ↔ GPU',
          mensaje
        )
      }
    } else {
      agregarPendiente(
        detalles,
        'gpu',
        'GPU ↔ Fuente',
        'No hay suficiente información para verificar el consumo recomendado.'
      )
    }
  }

  /*
   * ============================================================
   * 10. FUENTE ↔ GABINETE
   * ============================================================
   */

  if (
    fuente &&
    gabinete
  ) {
    const fuenteFormato =
      obtenerValor(
        fuente,
        'form_factor'
      )

    const gabineteFormato =
      obtenerValor(
        gabinete,
        'form_factor'
      )

    if (
      fuenteFormato &&
      gabineteFormato
    ) {
      const fuenteNormalizada =
        normalizarTexto(
          fuenteFormato
        )

      const gabineteNormalizado =
        normalizarTexto(
          gabineteFormato
        )

      if (
        fuenteNormalizada === 'atx' &&
        [
          'atx',
          'micro-atx',
        ].includes(
          gabineteNormalizado
        )
      ) {
        agregarCompatible(
          detalles,
          'psu',
          'Fuente ↔ Gabinete',
          `La fuente ATX puede utilizarse en un gabinete ${gabineteFormato}.`
        )

        agregarCompatible(
          detalles,
          'case',
          'Gabinete ↔ Fuente',
          'El formato del gabinete es compatible con una fuente ATX.'
        )
      } else {
        agregarPendiente(
          detalles,
          'psu',
          'Fuente ↔ Gabinete',
          'No hay suficiente información física para confirmar el montaje de la fuente.'
        )
      }
    } else {
      agregarPendiente(
        detalles,
        'psu',
        'Fuente ↔ Gabinete',
        'Falta información de formato para verificar el montaje.'
      )
    }
  }

  /*
   * ============================================================
   * RESULTADO
   * ============================================================
   */

  return {
    compatible: errores.length === 0,
    errores,
    advertencias,
    detalles,
  }
}