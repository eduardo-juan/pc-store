const imagenesPorCategoria = {
  procesadores: 'https://placehold.co/900x700/111111/d4af37?text=Procesador',
  graficas: 'https://placehold.co/900x700/111111/d4af37?text=Tarjeta+grafica',
  memoria: 'https://placehold.co/900x700/111111/d4af37?text=Memoria+RAM',
  almacenamiento: 'https://placehold.co/900x700/111111/d4af37?text=Almacenamiento',
  perifericos: 'https://placehold.co/900x700/111111/d4af37?text=Periferico',
}

export function obtenerImagenProducto(producto) {
  if (producto?.imagen_principal) return producto.imagen_principal

  const categoria = String(
    producto?.categorias?.nombre || producto?.categoria?.nombre || ''
  ).toLowerCase()

  if (categoria.includes('proces')) return imagenesPorCategoria.procesadores
  if (categoria.includes('graf') || categoria.includes('video'))
    return imagenesPorCategoria.graficas
  if (categoria.includes('mem')) return imagenesPorCategoria.memoria
  if (categoria.includes('almac') || categoria.includes('disco') || categoria.includes('ssd'))
    return imagenesPorCategoria.almacenamiento
  return imagenesPorCategoria.perifericos
}
