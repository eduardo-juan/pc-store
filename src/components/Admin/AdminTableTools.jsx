import { useEffect } from "react";

import { supabase } from "../../supabaseClient";

const ADMIN_PATHS = [
  "/admin/productos",
  "/admin/inventario",
  "/admin/categorias",
  "/admin/ordenes",
  "/admin/usuarios",
  "/admin/empleados",
  "/admin/ventas",
  "/admin/auditoria",
];

const PAGE_SIZE = 10;

const limpiarBusqueda = (valor = "", max = 100) =>
  String(valor)
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ0-9\s_@.\-]/g, "")
    .slice(0, max);

const esRutaAdmin = () =>
  ADMIN_PATHS.some((ruta) => window.location.pathname === ruta);

const textoFecha = (valor) => {
  if (!valor) return null;

  const texto = String(valor);

  const iso = texto.match(/(\d{4})[-/]?(\d{2})[-/]?(\d{2})/);

  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const local = texto.match(/(\d{2})[/]?(\d{2})[/](\d{4})/);

  if (local) return `${local[3]}-${local[2]}-${local[1]}`;

  const fecha = new Date(texto);

  return Number.isNaN(fecha.getTime())
    ? null
    : fecha.toISOString().slice(0, 10);
};

const tieneColumnaFecha = (table) =>
  Array.from(table.querySelectorAll("thead th")).some((th) =>
    /fecha|hora|cread|actualiz/i.test(th.textContent || ""),
  );

const obtenerMapaIds = async () => {
  const ruta = window.location.pathname;

  if (ruta === "/admin/productos") {
    const { data } = await supabase
      .from("productos")
      .select("id,nombre,marca")
      .order("id");

    return {
      tipo: "productos",
      data: data || [],
    };
  }

  if (ruta === "/admin/usuarios" || ruta === "/admin/empleados") {
    const { data } = await supabase
      .from("usuarios")
      .select("id,nombre,apellido,email")
      .order("id");

    return {
      tipo: "usuarios",
      data: data || [],
    };
  }

  if (ruta === "/admin/inventario") {
    const { data } = await supabase
      .from("inventario_historial")
      .select("id,producto_id,created_at,productos(nombre)")
      .order("created_at", { ascending: false })
      .limit(50);

    return {
      tipo: "inventario",
      data: data || [],
    };
  }

  return null;
};

const aplicarIdsTabla = (table, mapa) => {
  if (!mapa || table.dataset.idsReales === "true") return;

  const headers = Array.from(table.querySelectorAll("thead th"));

  if (headers.some((th) => /^id$/i.test((th.textContent || "").trim()))) {
    table.dataset.idsReales = "true";
    return;
  }

  const th = document.createElement("th");
  th.textContent = "ID";

  table.querySelector("thead tr")?.prepend(th);

  const filas = Array.from(table.querySelectorAll("tbody tr")).filter(
    (fila) => fila.querySelectorAll("td").length,
  );

  filas.forEach((fila) => {
    const td = document.createElement("td");
    const texto = (fila.textContent || "").trim().toLowerCase();

    let registro = null;

    if (mapa.tipo === "productos") {
      registro = mapa.data.find(
        (item) =>
          texto.includes((item.nombre || "").toLowerCase()) &&
          (!item.marca || texto.includes((item.marca || "").toLowerCase())),
      );
    } else if (mapa.tipo === "usuarios") {
      registro = mapa.data.find((item) => {
        const email = (item.email || "").toLowerCase();

        const nombre = `${item.nombre || ""} ${item.apellido || ""}`
          .trim()
          .toLowerCase();

        return (
          (email && texto.includes(email)) || (nombre && texto.includes(nombre))
        );
      });
    }

    td.textContent = registro?.id != null ? String(registro.id) : "—";

    fila.prepend(td);
  });

  table.dataset.idsReales = "true";
};

const aplicarIdsInventario = (mapa) => {
  if (!mapa || mapa.tipo !== "inventario") return;

  document.querySelectorAll(".pc-card").forEach((card) => {
    if (card.dataset.idInventario === "true") return;

    const texto = card.textContent || "";

    if (!/→/.test(texto) || !/\([^)]*\)/.test(texto)) return;

    const registro = mapa.data.find((item) => {
      const nombre = item.productos?.nombre || "";

      if (!nombre || !texto.includes(nombre)) return false;

      const fecha = item.created_at
        ? new Date(item.created_at).toLocaleDateString("es-HN")
        : "";

      return !fecha || texto.includes(fecha);
    });

    if (!registro) return;

    const etiqueta = document.createElement("div");

    etiqueta.textContent = `ID: ${registro.id}`;

    etiqueta.style.cssText =
      "font-size:11px;opacity:.55;margin-bottom:4px;font-weight:600;";

    const primera = card.querySelector("p");

    if (primera) primera.before(etiqueta);

    card.dataset.idInventario = "true";
  });
};

const instalar = (wrapper, mapa) => {
  if (wrapper.dataset.adminTools === "true") return;

  const table = wrapper.querySelector("table");

  if (!table || !table.querySelector("tbody")) return;

  aplicarIdsTabla(table, mapa);

  wrapper.dataset.adminTools = "true";

  const controles = document.createElement("div");

  controles.style.cssText =
    "display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:16px 20px;border-bottom:1px solid #e5e5e5;";

  const buscador = document.createElement("input");

  buscador.type = "search";
  buscador.placeholder = "Buscar en esta lista...";
  buscador.className = "pc-input";

  buscador.style.cssText = "min-width:240px;flex:1;max-width:420px;";

  const fecha = document.createElement("input");

  fecha.type = "date";
  fecha.className = "pc-input";
  fecha.title = "Filtrar por día";

  fecha.style.cssText = "min-width:170px;";

  const limpiar = document.createElement("button");

  limpiar.type = "button";
  limpiar.className = "pc-btn pc-btn-light";
  limpiar.title = "Borrar filtros";
  limpiar.setAttribute("aria-label", "Borrar filtros");

  limpiar.style.cssText =
    "width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;padding:0;";

  limpiar.innerHTML = `
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  `;

  const paginacion = document.createElement("div");

  paginacion.style.cssText =
    "display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:14px 20px;border-top:1px solid #e5e5e5;";

  const anterior = document.createElement("button");

  anterior.type = "button";
  anterior.className = "pc-btn pc-btn-light";
  anterior.textContent = "Anterior";

  const indicador = document.createElement("span");

  indicador.style.cssText =
    "font-size:.9rem;color:#666;min-width:110px;text-align:center;";

  const siguiente = document.createElement("button");

  siguiente.type = "button";
  siguiente.className = "pc-btn pc-btn-light";
  siguiente.textContent = "Siguiente";

  controles.appendChild(buscador);

  if (
    tieneColumnaFecha(table) &&
    !wrapper.querySelector('input[type="date"]')
  ) {
    controles.appendChild(fecha);
  }

  controles.appendChild(limpiar);

  wrapper.insertBefore(controles, table);

  paginacion.append(anterior, indicador, siguiente);

  wrapper.appendChild(paginacion);

  let pagina = 1;

  const aplicar = () => {
    const filas = Array.from(table.querySelectorAll("tbody tr"));

    const termino = limpiarBusqueda(buscador.value).trim().toLowerCase();

    const dia = fecha.value;

    const filtradas = filas.filter((fila) => {
      const coincideTexto =
        !termino || (fila.textContent || "").toLowerCase().includes(termino);

      let coincideFecha = true;

      if (dia) {
        const valoresFecha = Array.from(fila.querySelectorAll("td"))
          .map((celda) => textoFecha(celda.textContent))
          .filter(Boolean);

        coincideFecha = valoresFecha.includes(dia);
      }

      return coincideTexto && coincideFecha;
    });

    const totalPaginas = Math.max(1, Math.ceil(filtradas.length / PAGE_SIZE));

    if (pagina > totalPaginas) pagina = totalPaginas;

    const inicio = (pagina - 1) * PAGE_SIZE;

    const visibles = new Set(filtradas.slice(inicio, inicio + PAGE_SIZE));

    filas.forEach((fila) => {
      fila.style.display = visibles.has(fila) ? "" : "none";
    });

    indicador.textContent = `Página ${pagina} de ${totalPaginas}`;

    anterior.disabled = pagina <= 1;
    siguiente.disabled = pagina >= totalPaginas;
  };

  buscador.addEventListener("input", () => {
    const limpio = limpiarBusqueda(buscador.value);

    if (buscador.value !== limpio) {
      buscador.value = limpio;
    }

    pagina = 1;
    aplicar();
  });

  fecha.addEventListener("change", () => {
    pagina = 1;
    aplicar();
  });

  limpiar.addEventListener("click", () => {
    buscador.value = "";
    fecha.value = "";
    pagina = 1;
    aplicar();
  });

  anterior.addEventListener("click", () => {
    if (pagina > 1) {
      pagina -= 1;
      aplicar();
    }
  });

  siguiente.addEventListener("click", () => {
    pagina += 1;
    aplicar();
  });

  aplicar();
};

export default function AdminTableTools() {
  useEffect(() => {
    let mapa = null;

    const cargarMapa = async () => {
      mapa = await obtenerMapaIds();
    };

    cargarMapa();

    const escanear = () => {
      if (!esRutaAdmin()) return;

      aplicarIdsInventario(mapa);

      document
        .querySelectorAll(".pc-table-wrapper")
        .forEach((wrapper) => instalar(wrapper, mapa));
    };

    escanear();

    const observer = new MutationObserver(escanear);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
