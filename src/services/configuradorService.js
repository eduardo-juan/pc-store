import { supabase } from "../supabaseClient";

const CAMPOS_COMPONENTES = `
  id,
  producto_id,
  tipo,
  activo,
  socket,
  ram_tipo,
  ram_max_gb,
  ram_slots,
  form_factor,
  consumo_w,
  capacidad_w,
  interfaz_efectiva,
  longitud_mm,
  capacidad_gb,
  consumo_max_w,
  socket_compatibles,
  nombre,
  marca,
  modelo,
  precio,
  precio_descuento,
  stock,
  imagen_principal,
  especificaciones
`;

function transformarComponente(item) {
  return {
    id: item.id,
    producto_id: item.producto_id,
    tipo: item.tipo,
    activo: item.activo,

    socket: item.socket,
    ram_tipo: item.ram_tipo,
    ram_max_gb: item.ram_max_gb,
    ram_slots: item.ram_slots,
    form_factor: item.form_factor,

    consumo_w: item.consumo_w,
    consumo_max_w: item.consumo_max_w,
    capacidad_w: item.capacidad_w,

    interfaz: item.interfaz_efectiva ?? null,

    longitud_mm: item.longitud_mm,
    capacidad_gb: item.capacidad_gb,

    socket_compatibles:
      item.socket_compatibles || [],

    producto: {
      id: item.producto_id,
      nombre: item.nombre,
      precio: item.precio,
      precio_descuento: item.precio_descuento,
      stock: item.stock,
      imagen_principal: item.imagen_principal,
      marca: item.marca,
      modelo: item.modelo,
      especificaciones:
        item.especificaciones || {},
    },
  };
}

export async function obtenerComponentesPorTipo(tipo) {
  const { data, error } = await supabase
    .from("v_configurador_componentes")
    .select(CAMPOS_COMPONENTES)
    .eq("tipo", tipo)
    .eq("activo", true)
    .order("id");

  if (error) {
    console.error(
      "Error obteniendo componentes por tipo:",
      error,
    );

    throw error;
  }

  return (data || []).map(transformarComponente);
}

export async function obtenerTodosLosComponentes() {
  const { data, error } = await supabase
    .from("v_configurador_componentes")
    .select(CAMPOS_COMPONENTES)
    .eq("activo", true)
    .order("tipo")
    .order("id");

  if (error) {
    console.error(
      "Error obteniendo todos los componentes:",
      error,
    );

    throw error;
  }

  return (data || []).map(transformarComponente);
}