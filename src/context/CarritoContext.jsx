import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CarritoContext = createContext(null);

const CLAVE_STORAGE = "pc-store-carrito";
const COSTO_ARMADO_PC = 1500;

export function CarritoProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_STORAGE);
      return guardado ? JSON.parse(guardado) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(items));
  }, [items]);

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
      const existente = actuales.find(
        (item) =>
          item.tipo === "producto" &&
          item.producto_id === producto.id
      );

      if (existente) {
        const nuevaCantidad =
          existente.cantidad + cantidadNumero;

        if (nuevaCantidad > producto.stock) {
          resultado = {
            success: false,
            message: "No hay suficiente stock",
          };

          return actuales;
        }

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

  const agregarConfiguracion = (seleccionados) => {
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

  const vaciarCarrito = () => {
    setItems([]);
  };

  const cantidadTotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + Number(item.cantidad || 0),
        0
      ),
    [items]
  );

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

export function useCarrito() {
  const context = useContext(CarritoContext);

  if (!context) {
    throw new Error(
      "useCarrito debe usarse dentro de CarritoProvider"
    );
  }

  return context;
}