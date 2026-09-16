import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CarritoContext = createContext(null)

const CLAVE_STORAGE = 'pc-store-carrito'

export function CarritoProvider({ children }) {
  // Cargar carrito al iniciar.
  const [items, setItems] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_STORAGE)
      return guardado ? JSON.parse(guardado) : []
    } catch {
      return []
    }
  })

  // Guardar cada cambio.
  useEffect(() => {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items))
  }, [items])

  const agregarProducto = (producto, cantidad = 1) => {
    if (!producto || producto.stock <= 0) {
      return {
        success: false,
        message: 'Producto sin stock',
      }
    }

    const precio = Number(producto.precio_descuento || producto.precio)

    let resultado = {
      success: true,
      message: 'Producto agregado al carrito',
    }

    setItems((actuales) => {
      const existente = actuales.find((item) => item.producto_id === producto.id)

      if (existente) {
        const nuevaCantidad = existente.cantidad + cantidad

        if (nuevaCantidad > producto.stock) {
          resultado = {
            success: false,
            message: 'No hay suficiente stock',
          }

          return actuales
        }

        return actuales.map((item) =>
          item.producto_id === producto.id
            ? {
                ...item,
                cantidad: nuevaCantidad,
                stock: producto.stock,
              }
            : item
        )
      }

      return [
        ...actuales,
        {
          producto_id: producto.id,
          nombre: producto.nombre,
          imagen_principal: producto.imagen_principal,
          precio,
          cantidad,
          stock: producto.stock,
        },
      ]
    })

    return resultado
  }

  const cambiarCantidad = (productoId, cantidad) => {
    const cantidadNumero = Number(cantidad)

    if (cantidadNumero <= 0) {
      eliminarProducto(productoId)
      return
    }

    setItems((actuales) =>
      actuales.map((item) => {
        if (item.producto_id !== productoId) {
          return item
        }

        const cantidadFinal = Math.min(cantidadNumero, item.stock)

        return {
          ...item,
          cantidad: cantidadFinal,
        }
      })
    )
  }

  const eliminarProducto = (productoId) => {
    setItems((actuales) => actuales.filter((item) => item.producto_id !== productoId))
  }

  const vaciarCarrito = () => {
    setItems([])
  }

  const cantidadTotal = useMemo(
    () => items.reduce((total, item) => total + item.cantidad, 0),
    [items]
  )

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.precio * item.cantidad, 0),
    [items]
  )

  return (
    <CarritoContext.Provider
      value={{
        items,
        agregarProducto,
        cambiarCantidad,
        eliminarProducto,
        vaciarCarrito,
        cantidadTotal,
        subtotal,
      }}
    >
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  const context = useContext(CarritoContext)

  if (!context) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider')
  }

  return context
}
