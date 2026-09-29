// ============================================================
// DOCUMENTACIÓN AMPLIADA
// Archivo: src/context/CarritoContext.jsx
// Responsabilidad: Forma parte del funcionamiento de PC Store.
// Criterio: mantener aquí solo la responsabilidad de este módulo y delegar operaciones compartidas a la capa correspondiente.
// ============================================================

// ============================================================
// CONTEXTO DEL CARRITO
// Centraliza el estado y las operaciones del carrito de PC Store.
// Aquí se controla la persistencia local, productos normales,
// configuraciones de PC, cantidades y cálculos del subtotal.
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Contexto compartido para que cualquier componente pueda acceder
// al carrito sin tener que pasar sus datos manualmente por props.
const CarritoContext = createContext(null);

// Clave utilizada para guardar el carrito en localStorage.
// Esto permite conservarlo al recargar o cerrar el navegador.
const CLAVE_STORAGE = "pc-store-carrito";

// Cargo adicional aplicado cuando el cliente solicita el armado
// de una PC mediante el configurador.
const COSTO_ARMADO_PC = 1500;

export function CarritoProvider({ children }) {
  // Carga inicial del carrito desde localStorage.
  // Si no existe o los datos están dañados, iniciamos con un arreglo vacío.
  const [items, setItems] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_STORAGE);
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  // Cada vez que cambia el carrito, guardamos su estado actualizado.
  useEffect(() => {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items));
  }, [items]);

  // Agrega un producto individual al carrito.
  // También evita cantidades inválidas y cantidades superiores al stock conocido.
  const agregarProducto = (producto, cantidad = 1) => {
    if (!producto || producto.stock <= 0) {
      return {
        success: false,
        message: "Producto sin stock",
      };
    }

    const cantidadNumero = Number(cantidad);

    if (cantidadNumero <= 0) {
      return {
        success: false,
        message: "Cantidad inválida",
      };
    }

    // El precio utilizado por el carrito es el precio de descuento cuando existe;
    // de lo contrario utiliza el precio normal.
    const precio = Number(
      producto.precio_descuento ||
        producto.precio ||
        0
    );

    let resultado = {
      success: true,
      message: "Producto agregado al carrito",
    };

    setItems((actuales) => {
      // Buscamos únicamente un producto normal con el mismo ID.
      // Las configuraciones tienen un identificador diferente.
      const existente = actuales.find(
        (item) =>
          item.tipo === "producto" &&
          item.producto_id === producto.id
      );

      if (existente) {
        const nuevaCantidad =
          existente.cantidad + cantidadNumero;

        // No permitimos superar el stock disponible conocido.
        if (nuevaCantidad > producto.stock) {
          resultado = {
            success: false,
            message: "No hay suficiente stock",
          };

          return actuales;
        }

        // Si ya existe, actualizamos su cantidad y stock conocido.
        return actuales.map((item) =>
          item === existente
            ? {
                ...item,
                cantidad: nuevaCantidad,
                stock: producto.stock,
              }
            : item
        );
      }

      // Si no existe, creamos una nueva línea de producto en el carrito.
      return [
        ...actuales,
        {
          tipo: "producto",
          producto_id: producto.id,
          nombre: producto.nombre,
          imagen_principal: producto.imagen_principal,
          precio,
          cantidad: cantidadNumero,
          stock: producto.stock,
        },
      ];
    });

    return resultado;
  };

  // Agrega al carrito una PC completa creada mediante el configurador.
  const agregarConfiguracion = (seleccionados) => {
    // Convertimos las selecciones del configurador en una lista de componentes válidos.
    const componentes = Object.values(
      seleccionados || {}
    ).filter(
      (componente) => componente?.producto
    );

    if (componentes.length === 0) {
      return {
        success: false,
        message: "Selecciona al menos un componente",
      };
    }

    // Antes de crear la configuración comprobamos que ningún componente
    // seleccionado esté agotado.
    const sinStock = componentes.find(
      (componente) =>
        Number(componente.producto.stock) <= 0
    );

    if (sinStock) {
      return {
        success: false,
        message: `Sin stock: ${sinStock.producto.nombre}`,
      };
    }

    const productos = componentes.map(
      (componente) => componente.producto
    );

    // Calculamos el precio total de los componentes usando el descuento
    // cuando está disponible.
    const precioComponentes = productos.reduce(
      (total, producto) =>
        total +
        Number(
          producto.precio_descuento ||
            producto.precio ||
            0
        ),
      0
    );

    // Creamos una línea independiente para esta configuración.
    // Cada configuración recibe un UUID para poder modificarla o eliminarla.
    const configuracion = {
      tipo: "configurador",
      configuracion_id: crypto.randomUUID(),
      nombre: "PC Configurada",
      imagen_principal:
        productos.find(
          (producto) => producto.imagen_principal
        )?.imagen_principal || null,
      componentes: productos.map((producto) => ({
        producto_id: producto.id,
        nombre: producto.nombre,
        precio: Number(
          producto.precio_descuento ||
            producto.precio ||
            0
        ),
        stock: producto.stock,
        cantidad: 1,
      })),
      precio_componentes: precioComponentes,
      costo_armado: COSTO_ARMADO_PC,
      precio:
        precioComponentes + COSTO_ARMADO_PC,
      cantidad: 1,
    };

    setItems((actuales) => [
      ...actuales,
      configuracion,
    ]);

    return {
      success: true,
      message:
        "PC configurada agregada al carrito",
    };
  };

  // Cambia la cantidad de una línea del carrito.
  // Los productos normales respetan el stock; una configuración
  // puede manejar su cantidad como una unidad compuesta.
  const cambiarCantidad = (
    identificador,
    cantidad
  ) => {
    const cantidadNumero = Number(cantidad);

    if (cantidadNumero <= 0) {
      eliminarProducto(identificador);
      return;
    }

    setItems((actuales) =>
      actuales.map((item) => {
        // Cada tipo de artículo tiene su propio identificador.
        const id =
          item.tipo === "configurador"
            ? item.configuracion_id
            : item.producto_id;

        if (id !== identificador) {
          return item;
        }

        if (item.tipo === "configurador") {
          return {
            ...item,
            cantidad: cantidadNumero,
          };
        }

        // En un producto normal nunca permitimos superar el stock conocido.
        return {
          ...item,
          cantidad: Math.min(
            cantidadNumero,
            item.stock
          ),
        };
      })
    );
  };

  // Elimina una línea completa del carrito por su identificador.
  const eliminarProducto = (identificador) => {
    setItems((actuales) =>
      actuales.filter((item) => {
        const id =
          item.tipo === "configurador"
            ? item.configuracion_id
            : item.producto_id;

        return id !== identificador;
      })
    );
  };

  // Vacía completamente el carrito.
  const vaciarCarrito = () => {
    setItems([]);
  };

  // Cantidad total de unidades mostrada en el carrito.
  const cantidadTotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + Number(item.cantidad || 0),
        0
      ),
    [items]
  );

  // Subtotal calculado a partir del precio y cantidad de cada línea.
  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          Number(item.precio || 0) *
            Number(item.cantidad || 0),
        0
      ),
    [items]
  );

  // Exponemos estado, acciones y valores calculados a toda la aplicación.
  return (
    <CarritoContext.Provider
      value={{
        items,
        agregarProducto,
        agregarConfiguracion,
        cambiarCantidad,
        eliminarProducto,
        vaciarCarrito,
        cantidadTotal,
        subtotal,
        COSTO_ARMADO_PC,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

// Hook personalizado para consumir el contexto del carrito.
// El error ayuda a detectar si alguien intenta usarlo fuera del Provider.
export function useCarrito() {
  const context = useContext(CarritoContext);

  if (!context) {
    throw new Error(
      "useCarrito debe usarse dentro de CarritoProvider"
    );
  }

  return context;
}
