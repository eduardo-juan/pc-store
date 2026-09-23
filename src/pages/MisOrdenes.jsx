import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";

import { supabase } from "../supabaseClient";
import { useAuth } from "../hooks/useAuth";
import BotonAtras from "../components/BotonAtras";

const ORDENES_POR_PAGINA = 8;

const ESTADOS = [
  ["pendiente", "Pendiente"],
  ["pagada", "Pagada"],
  ["enviada", "Enviada"],
  ["entregada", "Entregada"],
  ["cancelada", "Cancelada"],
];

const limpiarBusqueda = (valor = "") =>
  String(valor)
    .replace(/[^\p{L}\p{N}\s@._-]/gu, "")
    .slice(0, 100);

export default function MisOrdenes() {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [cancelandoId, setCancelandoId] = useState(null);
  const [confirmandoId, setConfirmandoId] = useState(null);

  const [filtro, setFiltro] = useState("todas");
  const [fecha, setFecha] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    if (usuario) {
      cargarOrdenes();
    } else {
      setCargando(false);
    }
  }, [usuario]);

  useEffect(() => {
    setPagina(1);
  }, [filtro, fecha, busqueda]);

  const cargarOrdenes = async () => {
    if (!usuario) return;

    setCargando(true);
    setError("");

    try {
      const { data, error: consultaError } = await supabase
        .from("ordenes")
        .select("*")
        .eq("usuario_id", usuario.id)
        .order("created_at", {
          ascending: false,
        });

      if (consultaError) {
        throw consultaError;
      }

      const lista = data || [];

      const ids = [
        ...new Set(
          lista
            .map((orden) => orden.empleado_id)
            .filter(Boolean),
        ),
      ];

      let empleados = [];

      if (ids.length) {
        const { data: empleadosData } = await supabase
          .from("usuarios")
          .select("id,nombre,apellido,teléfono")
          .in("id", ids);

        empleados = empleadosData || [];
      }

      const mapa = new Map(
        empleados.map((empleado) => [
          empleado.id,
          empleado,
        ]),
      );

      setOrdenes(
        lista.map((orden) => ({
          ...orden,
          empleado: orden.empleado_id
            ? mapa.get(orden.empleado_id) || null
            : null,
        })),
      );
    } catch (consultaError) {
      setError(
        consultaError?.message ||
          "No se pudieron cargar tus órdenes.",
      );

      setOrdenes([]);
    } finally {
      setCargando(false);
    }
  };

  const cancelarOrden = async (id) => {
    const orden = ordenes.find(
      (item) => item.id === id,
    );

    if (!orden || orden.estado !== "pendiente") {
      setError("Esta orden ya no puede ser cancelada.");
      return;
    }

    if (
      !window.confirm(
        "¿Seguro que deseas cancelar esta orden? Esta acción no se puede deshacer y el stock será restaurado.",
      )
    ) {
      return;
    }

    setCancelandoId(id);
    setError("");

    const { error: rpcError } = await supabase.rpc(
      "cancelar_orden_pc_store",
      {
        p_orden_id: id,
        p_motivo: "Cancelada por el cliente.",
      },
    );

    setCancelandoId(null);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    await cargarOrdenes();
  };

  const confirmarRecepcion = async (id) => {
    const orden = ordenes.find(
      (item) => item.id === id,
    );

    if (!orden || orden.estado !== "enviada") {
      setError(
        "Solo puedes confirmar la recepción de órdenes enviadas.",
      );
      return;
    }

    if (
      !window.confirm(
        "¿Confirmas que recibiste esta orden?",
      )
    ) {
      return;
    }

    setConfirmandoId(id);
    setError("");

    const { error: rpcError } = await supabase.rpc(
      "confirmar_recepcion_orden",
      {
        p_orden_id: id,
      },
    );

    setConfirmandoId(null);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    await cargarOrdenes();
  };

  const ordenesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLocaleLowerCase();

    return ordenes.filter((orden) => {
      const estado = orden.estado || "pendiente";

      if (
        filtro === "activas" &&
        !["pendiente", "pagada", "enviada"].includes(
          estado,
        )
      ) {
        return false;
      }

      if (
        filtro !== "todas" &&
        filtro !== "activas" &&
        estado !== filtro
      ) {
        return false;
      }

      if (
        fecha &&
        orden.created_at &&
        new Date(orden.created_at).toLocaleDateString(
          "en-CA",
        ) !== fecha
      ) {
        return false;
      }

      if (q) {
        const nombresItems = (
          orden.items || []
        ).flatMap((item) => [
          item.nombre,
          ...(item.componentes || []).map(
            (componente) => componente.nombre,
          ),
        ]);

        const texto = [
          orden.id,
          orden.numero_orden,
          orden.nombre_cliente,
          orden.apellido_cliente,
          orden.email,
          orden.teléfono_contacto,
          orden.dirección_envío,
          orden.ciudad_envío,
          orden.referencia,
          orden.metodo_pago,
          orden["método_pago"],
          orden.tipo_orden,
          ...nombresItems,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase();

        if (!texto.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [ordenes, filtro, fecha, busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(
      ordenesFiltradas.length /
        ORDENES_POR_PAGINA,
    ),
  );

  const paginaActual = Math.min(
    pagina,
    totalPaginas,
  );

  const ordenesPagina = ordenesFiltradas.slice(
    (paginaActual - 1) *
      ORDENES_POR_PAGINA,
    paginaActual * ORDENES_POR_PAGINA,
  );

  return (
    <main className="pc-page">
      <div className="pc-container">
        <BotonAtras />

        <div className="pc-page-heading">
          <div>
            <span className="pc-kicker">
              Historial
            </span>

            <h1>Mis órdenes</h1>

            <p>
              Consulta el estado y resumen de
              tus pedidos.
            </p>
          </div>
        </div>

        {error && (
          <div className="pc-alert pc-alert-error">
            {error}
          </div>
        )}

        <div
          className="pc-card"
          style={{
            padding: 14,
            marginBottom: 20,
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            className="pc-input"
            value={busqueda}
            onChange={(e) =>
              setBusqueda(
                limpiarBusqueda(
                  e.target.value,
                ),
              )
            }
            placeholder="Buscar orden, cliente o producto..."
            aria-label="Buscar órdenes"
            style={{
              minWidth: 260,
              flex: "1 1 260px",
            }}
          />

          <select
            className="pc-select"
            value={filtro}
            onChange={(e) =>
              setFiltro(e.target.value)
            }
            style={{ minWidth: 180 }}
          >
            <option value="todas">
              Todas las órdenes
            </option>

            <option value="activas">
              Activas
            </option>

            <option value="pendiente">
              Pendientes
            </option>

            <option value="pagada">
              Pagadas
            </option>

            <option value="enviada">
              Enviadas
            </option>

            <option value="entregada">
              Entregadas
            </option>

            <option value="cancelada">
              Canceladas
            </option>
          </select>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Día:

            <input
              type="date"
              className="pc-input"
              value={fecha}
              onChange={(e) =>
                setFecha(e.target.value)
              }
            />
          </label>

          {(fecha ||
            filtro !== "todas" ||
            busqueda) && (
            <button
              type="button"
              className="pc-btn pc-btn-light"
              onClick={() => {
                setFecha("");
                setFiltro("todas");
                setBusqueda("");
              }}
            >
              Limpiar
            </button>
          )}

          <span
            style={{
              marginLeft: "auto",
              fontWeight: 600,
            }}
          >
            {ordenesFiltradas.length} órdenes
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gap: 16,
          }}
        >
          {cargando ? (
            <div
              className="pc-card"
              style={{
                padding: 30,
                textAlign: "center",
              }}
            >
              Cargando órdenes...
            </div>
          ) : (
            <>
              {ordenesPagina.map((orden) => {
                const estado =
                  orden.estado || "pendiente";

                const subtotal = Number(
                  orden.subtotal || 0,
                );

                const envio = Number(
                  orden.envío || 0,
                );

                const descuento = Number(
                  orden.descuento || 0,
                );

                const total = Number(
                  orden.total || 0,
                );

                const tipoOrden =
                  orden.tipo_orden ||
                  "producto";

                const puedeCancelar =
                  estado === "pendiente";

                const empleado =
                  orden.empleado;

                const etiquetaTipo =
                  tipoOrden === "configurador"
                    ? "PC CONFIGURADA"
                    : tipoOrden === "mixta"
                      ? "COMPRA MIXTA"
                      : "PRODUCTO";

                return (
                  <article
                    className="pc-card pc-order-card"
                    key={orden.id}
                    style={{
                      padding: 20,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                        gap: 16,
                        flexWrap: "wrap",
                        marginBottom: 16,
                      }}
                    >
                      <div>
                        <div className="pc-kicker">
                          Orden #{orden.id} ·{" "}
                          {orden.numero_orden ||
                            "Sin número"}
                        </div>

                        <h2
                          style={{
                            margin:
                              "4px 0 0",
                            fontSize: 20,
                          }}
                        >
                          {
                            orden.nombre_cliente
                          }{" "}
                          {
                            orden.apellido_cliente
                          }
                        </h2>

                        <div
                          style={{
                            marginTop: 5,
                            color: "#666",
                            fontSize: 13,
                          }}
                        >
                          {orden.created_at
                            ? new Date(
                                orden.created_at,
                              ).toLocaleString()
                            : "-"}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                        }}
                      >
                        L{" "}
                        {total.toFixed(2)}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 7,
                        marginBottom: 16,
                      }}
                    >
                      <span
                        className={`pc-status pc-status-${estado}`}
                        style={{
                          padding:
                            "7px 11px",
                          fontWeight: 700,
                          border:
                            "2px solid currentColor",
                        }}
                      >
                        {ESTADOS.find(
                          ([valor]) =>
                            valor ===
                            estado,
                        )?.[1] ||
                          "Pendiente"}
                      </span>

                      <span
                        style={{
                          padding:
                            "7px 11px",
                          borderRadius: 999,
                          background:
                            "#f3f4f6",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {etiquetaTipo}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit,minmax(220px,1fr))",
                        gap: 14,
                      }}
                    >
                      {/* ENTREGA */}
                      <section
                        style={{
                          background:
                            "#fafafa",
                          borderRadius: 12,
                          padding: 14,
                        }}
                      >
                        <strong>
                          Entrega
                        </strong>

                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 13,
                            lineHeight: 1.7,
                          }}
                        >
                          {empleado ? (
                            <div
                              style={{
                                marginBottom: 8,
                              }}
                            >
                              <b>
                                Empleado encargado:
                              </b>

                              <div>
                                {
                                  empleado.nombre
                                }{" "}
                                {
                                  empleado.apellido
                                }
                              </div>

                              {empleado.teléfono && (
                                <div>
                                  <b>
                                    Teléfono
                                    empleado:
                                  </b>{" "}
                                  {
                                    empleado.teléfono
                                  }
                                </div>
                              )}
                            </div>
                          ) : (
                            <div
                              style={{
                                color: "#777",
                                marginBottom: 8,
                              }}
                            >
                              Empleado encargado:
                              {" "}
                              Pendiente de
                              asignación
                            </div>
                          )}

                          <div>
                            <b>
                              Receptor:
                            </b>{" "}
                            {
                              orden.nombre_cliente
                            }{" "}
                            {
                              orden.apellido_cliente ||
                              ""
                            }
                          </div>

                          <div>
                            <b>
                              Teléfono:
                            </b>{" "}
                            {
                              orden.teléfono_contacto ||
                              "-"
                            }
                          </div>

                          <div>
                            <b>
                              Dirección:
                            </b>{" "}
                            {
                              orden.dirección_envío ||
                              "-"
                            }
                          </div>

                          <div>
                            <b>
                              Ciudad:
                            </b>{" "}
                            {
                              orden.ciudad_envío ||
                              "-"
                            }
                          </div>

                          {orden.referencia && (
                            <div>
                              <b>
                                Referencia:
                              </b>{" "}
                              {
                                orden.referencia
                              }
                            </div>
                          )}
                        </div>
                      </section>

                      {/* RESUMEN CORREGIDO */}
                      <section
                        style={{
                          background:
                            "#fafafa",
                          borderRadius: 12,
                          padding: 14,
                        }}
                      >
                        <strong>
                          Resumen
                        </strong>

                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 13,
                            lineHeight: 1.8,
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              gap: 10,
                            }}
                          >
                            <span>
                              Subtotal
                            </span>

                            <b>
                              L{" "}
                              {subtotal.toFixed(
                                2,
                              )}
                            </b>
                          </div>

                          {descuento > 0 && (
                            <div
                              style={{
                                display:
                                  "flex",
                                justifyContent:
                                  "space-between",
                                gap: 10,
                                color:
                                  "#166534",
                              }}
                            >
                              <span>
                                Descuento
                                {orden.cupon_codigo
                                  ? ` (${orden.cupon_codigo})`
                                  : ""}
                              </span>

                              <b>
                                -L{" "}
                                {descuento.toFixed(
                                  2,
                                )}
                              </b>
                            </div>
                          )}

                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              gap: 10,
                            }}
                          >
                            <span>
                              Envío
                            </span>

                            <b>
                              L{" "}
                              {envio.toFixed(
                                2,
                              )}
                            </b>
                          </div>

                          <div
                            style={{
                              marginTop: 10,
                              paddingTop: 10,
                              borderTop:
                                "1px solid #ddd",
                              display:
                                "flex",
                              justifyContent:
                                "space-between",
                              gap: 10,
                              fontSize: 16,
                            }}
                          >
                            <strong>
                              Total
                            </strong>

                            <strong>
                              L{" "}
                              {total.toFixed(
                                2,
                              )}
                            </strong>
                          </div>

                          <div
                            style={{
                              marginTop: 8,
                            }}
                          >
                            Método de pago:{" "}
                            <b>
                              {orden[
                                "método_pago"
                              ] ||
                                orden.metodo_pago ||
                                "-"}
                            </b>
                          </div>
                        </div>
                      </section>

                      {/* PRODUCTOS */}
                      <section
                        style={{
                          background:
                            "#fafafa",
                          borderRadius: 12,
                          padding: 14,
                        }}
                      >
                        <strong>
                          Productos
                        </strong>

                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 13,
                            lineHeight: 1.7,
                          }}
                        >
                          {(
                            orden.items || []
                          ).map(
                            (
                              item,
                              index,
                            ) => {
                              const esPC =
                                item.tipo ===
                                "configurador";

                              const cantidad =
                                Number(
                                  item.cantidad ||
                                    1,
                                );

                              const subtotalItem =
                                Number(
                                  item.subtotal ||
                                    0,
                                );

                              return (
                                <div
                                  key={`${orden.id}-${index}`}
                                  style={{
                                    marginBottom:
                                      12,
                                  }}
                                >
                                  <div
                                    style={{
                                      display:
                                        "flex",
                                      justifyContent:
                                        "space-between",
                                      gap: 10,
                                      fontWeight:
                                        700,
                                    }}
                                  >
                                    <span>
                                      {
                                        cantidad
                                      }{" "}
                                      ×{" "}
                                      {item.nombre ||
                                        (esPC
                                          ? "PC Configurada"
                                          : "Producto")}
                                    </span>

                                    <b>
                                      L{" "}
                                      {subtotalItem.toFixed(
                                        2,
                                      )}
                                    </b>
                                  </div>

                                  {esPC && (
                                    <div
                                      style={{
                                        marginTop: 8,
                                        padding:
                                          "9px 10px",
                                        background:
                                          "#f3f4f6",
                                        borderRadius: 8,
                                      }}
                                    >
                                      <div
                                        style={{
                                          fontWeight:
                                            700,
                                          marginBottom:
                                            6,
                                        }}
                                      >
                                        Componentes
                                      </div>

                                      {(
                                        item.componentes ||
                                        []
                                      ).map(
                                        (
                                          componente,
                                          componenteIndex,
                                        ) => {
                                          const cantidadComponente =
                                            Number(
                                              componente.cantidad ||
                                                1,
                                            );

                                          const precioComponente =
                                            Number(
                                              componente.precio ||
                                                0,
                                            );

                                          const subtotalComponente =
                                            Number(
                                              componente.subtotal ??
                                                precioComponente *
                                                  cantidadComponente,
                                            );

                                          return (
                                            <div
                                              key={`${orden.id}-${index}-${componenteIndex}`}
                                              style={{
                                                display:
                                                  "flex",
                                                justifyContent:
                                                  "space-between",
                                                gap: 10,
                                                fontSize:
                                                  12,
                                                marginBottom:
                                                  4,
                                              }}
                                            >
                                              <span>
                                                {
                                                  cantidadComponente
                                                }{" "}
                                                ×{" "}
                                                {
                                                  componente.nombre
                                                }
                                              </span>

                                              <b>
                                                L{" "}
                                                {subtotalComponente.toFixed(
                                                  2,
                                                )}
                                              </b>
                                            </div>
                                          );
                                        },
                                      )}

                                      <div
                                        style={{
                                          marginTop: 7,
                                          paddingTop: 7,
                                          borderTop:
                                            "1px solid #ddd",
                                          display:
                                            "flex",
                                          justifyContent:
                                            "space-between",
                                          gap: 10,
                                          fontSize: 12,
                                        }}
                                      >
                                        <span>
                                          Armado
                                        </span>

                                        <b>
                                          L{" "}
                                          {Number(
                                            item.costo_armado ||
                                              1500,
                                          ).toFixed(
                                            2,
                                          )}
                                        </b>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            },
                          )}
                        </div>
                      </section>
                    </div>

                    <div
                      style={{
                        marginTop: 16,
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        className="pc-btn pc-btn-light"
                        onClick={() =>
                          navigate(
                            `/mis-ordenes/${orden.id}`,
                          )
                        }
                      >
                        Ver detalle de la orden
                      </button>

                      {estado ===
                        "enviada" && (
                        <button
                          type="button"
                          className="pc-btn pc-btn-primary"
                          disabled={
                            confirmandoId ===
                            orden.id
                          }
                          onClick={() =>
                            confirmarRecepcion(
                              orden.id,
                            )
                          }
                        >
                          {confirmandoId ===
                          orden.id
                            ? "Confirmando..."
                            : "Confirmar recepción"}
                        </button>
                      )}

                      {puedeCancelar && (
                        <button
                          type="button"
                          className="pc-btn pc-btn-danger"
                          disabled={
                            cancelandoId ===
                            orden.id
                          }
                          onClick={() =>
                            cancelarOrden(
                              orden.id,
                            )
                          }
                        >
                          {cancelandoId ===
                          orden.id
                            ? "Cancelando..."
                            : "Cancelar orden"}
                        </button>
                      )}
                    </div>

                    {estado ===
                      "cancelada" &&
                      orden.motivo_cancelacion && (
                        <div
                          style={{
                            background:
                              "#fef2f2",
                            border:
                              "1px solid #fecaca",
                            borderRadius: 10,
                            padding: 12,
                            marginTop: 16,
                            color:
                              "#991b1b",
                          }}
                        >
                          <b>
                            Motivo de
                            cancelación:
                          </b>{" "}
                          {
                            orden.motivo_cancelacion
                          }
                        </div>
                      )}
                  </article>
                );
              })}

              {ordenesFiltradas.length ===
                0 && (
                <div className="pc-empty">
                  <div className="pc-empty-icon">
                    <Package
                      size={48}
                      strokeWidth={1.5}
                    />
                  </div>

                  <h2>
                    {filtro ===
                      "todas" &&
                    !busqueda &&
                    !fecha
                      ? "Todavía no tienes órdenes"
                      : "No hay órdenes con estos filtros"}
                  </h2>
                </div>
              )}
            </>
          )}
        </div>

        {ordenesFiltradas.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              marginTop: 24,
            }}
          >
            <button
              type="button"
              className="pc-btn pc-btn-light"
              disabled={
                paginaActual === 1
              }
              onClick={() =>
                setPagina((valor) =>
                  Math.max(
                    1,
                    valor - 1,
                  ),
                )
              }
            >
              Anterior
            </button>

            <span
              style={{
                fontWeight: 600,
              }}
            >
              Página {paginaActual} de{" "}
              {totalPaginas}
            </span>

            <button
              type="button"
              className="pc-btn pc-btn-light"
              disabled={
                paginaActual ===
                totalPaginas
              }
              onClick={() =>
                setPagina((valor) =>
                  Math.min(
                    totalPaginas,
                    valor + 1,
                  ),
                )
              }
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </main>
  );
}