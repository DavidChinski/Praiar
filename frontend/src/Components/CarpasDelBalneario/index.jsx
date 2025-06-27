import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import "./CarpasDelBalneario.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function CarpasDelBalneario() {
  const { id } = useParams();
  const location = useLocation();
  let { fechaInicio, fechaFin } = location.state || {};

  if (!fechaInicio || !fechaFin) {
    const today = new Date();
    fechaInicio = today.toISOString().split('T')[0];
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    fechaFin = tomorrow.toISOString().split('T')[0];
  }

  const containerRef = useRef(null);
  const [carpas, setCarpas] = useState([]);
  const [elementos, setElementos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [esDuenio, setEsDuenio] = useState(false);
  const [usuarioLogueado, setUsuarioLogueado] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [carpaEditando, setCarpaEditando] = useState(null);
  const [balnearioInfo, setBalnearioInfo] = useState(null);
  const [Ciudad, setCiudad] = useState(null);
  const [mostrarModalServicios, setMostrarModalServicios] = useState(false);
  const [todosLosServicios, setTodosLosServicios] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [tiposUbicacion, setTiposUbicacion] = useState([]);
  const [mostrarAgregarCarpa, setMostrarAgregarCarpa] = useState(false);
  const [nuevaCarpa, setNuevaCarpa] = useState({
    id_tipo_ubicacion: "",
    cant_sillas: 2,
    cant_mesas: 1,
    cant_reposeras: 2,
    capacidad: 4,
  });
  const [precios, setPrecios] = useState([]);
  const navigate = useNavigate();

  // Obtener usuario logueado y balneario info
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario && usuario.auth_id) {
      setUsuarioLogueado(true);
      fetch(`http://localhost:3000/api/balneario/${id}/info`)
        .then(res => res.json())
        .then(info => {
          setBalnearioInfo(info);
          setCiudad(info.ciudad || "");
          if (info.id_usuario === usuario.auth_id) setEsDuenio(true);
        });
    } else {
      setUsuarioLogueado(false);
    }
  }, [id]);

  // Cargar carpas, elementos, servicios, tipos de ubicacion
  useEffect(() => {
    setLoading(true);

    fetch(`http://localhost:3000/api/balneario/${id}/carpas`)
      .then(res => res.json())
      .then(data => {
        setCarpas(data.map((c, i) => ({
          ...c,
          x: c.x ?? i * 100,
          y: c.y ?? 0,
        })));
      });

    fetch(`http://localhost:3000/api/balneario/${id}/elementos`)
      .then(res => res.json())
      .then(setElementos);

    fetch(`http://localhost:3000/api/balneario/${id}/servicios-todos`)
      .then(res => res.json())
      .then(setTodosLosServicios);

    fetch("http://localhost:3000/api/tipos-ubicaciones")
      .then(res => res.json())
      .then(setTiposUbicacion);

    setLoading(false);
  }, [id]);

  // Cargar reservas
  useEffect(() => {
    if (!fechaInicio || !fechaFin) return;
    fetch(`http://localhost:3000/api/balneario/${id}/reservas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
      .then(res => res.json())
      .then(setReservas);
  }, [id, fechaInicio, fechaFin]);

  // Cargar precios del balneario
  useEffect(() => {
    fetch(`http://localhost:3000/api/balneario/${id}/precios`)
      .then(res => res.json())
      .then(setPrecios);
  }, [id]);

  // Obtener el tipo de carpa por id_tipo_ubicacion
  const getTipoCarpa = (carpa) => {
    return tiposUbicacion.find(t => t.id_tipo_ubicaciones === carpa.id_tipo_ubicacion)?.nombre || "simple";
  };

  const carpaReservada = (idUbicacion) => {
    if (!fechaInicio || !fechaFin) return false;
    const inicio = new Date(fechaInicio + 'T00:00:00');
    const fin = new Date(fechaFin + 'T00:00:00');

    return reservas.some(res => {
      if (res.id_ubicacion !== idUbicacion) return false;
      const resInicio = new Date(res.fecha_inicio + 'T00:00:00');
      const resFin = new Date(res.fecha_salida + 'T00:00:00');
      return resInicio <= fin && resFin >= inicio;
    });
  };

  // Servicios toggle
  async function toggleServicio(servicioId, tiene) {
    if (tiene) {
      await fetch(`http://localhost:3000/api/balneario/${id}/servicio/${servicioId}`, {
        method: "DELETE"
      });
    } else {
      await fetch(`http://localhost:3000/api/balneario/${id}/servicio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_servicio: servicioId }),
      });
    }

    fetch(`http://localhost:3000/api/balneario/${id}/info`)
      .then(res => res.json())
      .then(info => setBalnearioInfo(prev => ({ ...prev, servicios: info.servicios })));
  }

  // Agregar elemento
  async function agregarElemento(tipo) {
    const res = await fetch(`http://localhost:3000/api/balneario/${id}/elemento`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo }),
    });
    const data = await res.json();
    setElementos((prev) => [...prev, data]);
  }

  // Drag & drop
  function onMouseMove(e) {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 40;
    const y = e.clientY - rect.top - 40;

    if (dragging.tipo === "carpa") {
      setCarpas((prev) =>
        prev.map((c) =>
          c.id_carpa === dragging.id ? { ...c, x, y } : c
        )
      );
    } else if (dragging.tipo === "elemento") {
      setElementos((prev) =>
        prev.map((el) =>
          el.id_elemento === dragging.id ? { ...el, x, y } : el
        )
      );
    }
  }

  async function onMouseUp() {
    if (!dragging) return;

    if (dragging.tipo === "carpa") {
      const carpa = carpas.find((c) => c.id_carpa === dragging.id);
      if (carpa) {
        await fetch(`http://localhost:3000/api/balneario/carpas/${carpa.id_carpa}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ x: carpa.x, y: carpa.y }),
        });
      }
    } else if (dragging.tipo === "elemento") {
      const el = elementos.find((el) => el.id_elemento === dragging.id);
      if (el) {
        await fetch(`http://localhost:3000/api/balneario/elementos/${el.id_elemento}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ x: el.x, y: el.y }),
        });
      }
    }

    setDragging(null);
  }

  async function eliminarCarpa(id_carpa) {
    await fetch(`http://localhost:3000/api/balneario/carpas/${id_carpa}`, { method: "DELETE" });
    setCarpas((prev) => prev.filter((carpa) => carpa.id_carpa !== id_carpa));
  }

  function handleEditarCarpa(carpa) {
    setCarpaEditando({ ...carpa });
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setCarpaEditando((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function guardarCambios() {
    const { id_carpa, ...datos } = carpaEditando;
    await fetch(`http://localhost:3000/api/balneario/carpas/${id_carpa}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    setCarpas((prev) =>
      prev.map((c) => (c.id_carpa === id_carpa ? { ...c, ...datos } : c))
    );
    setCarpaEditando(null);
  }

  function rotarElemento(id_elemento) {
    setElementos((prev) =>
      prev.map((el) =>
        el.id_elemento === id_elemento
          ? { ...el, rotado: (el.rotado || 0) + 90 }
          : el
      )
    );

    const el = elementos.find((e) => e.id_elemento === id_elemento);
    if (el) {
      fetch(`http://localhost:3000/api/balneario/elementos/${id_elemento}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rotado: (el.rotado || 0) + 90 }),
      });
    }
  }

  // AGREGAR CARPA/SOMBRILLA
  async function handleAgregarCarpa() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!nuevaCarpa.id_tipo_ubicacion) return alert("Seleccione el tipo");
    const res = await fetch(`http://localhost:3000/api/balneario/${id}/carpas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...nuevaCarpa,
        id_usuario: usuario.auth_id
      })
    });
    if (res.ok) {
      setMostrarAgregarCarpa(false);
      setNuevaCarpa({
        id_tipo_ubicacion: "",
        cant_sillas: 2,
        cant_mesas: 1,
        cant_reposeras: 2,
        capacidad: 4,
      });
      fetch(`http://localhost:3000/api/balneario/${id}/carpas`)
        .then(res => res.json())
        .then(data => {
          setCarpas(data.map((c, i) => ({
            ...c,
            x: c.x ?? i * 100,
            y: c.y ?? 0,
          })));
        });
    } else {
      alert("Hubo un error al agregar la carpa/sombrilla");
    }
  }

  if (loading) return <p>Cargando carpas...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="carpas-del-balneario">
      <h2>{balnearioInfo?.nombre || 'Carpas del Balneario'}</h2>

      {balnearioInfo && (
        <div className="balneario-info">
          <p><strong>Dirección:</strong> {balnearioInfo.direccion}</p>
          <p><strong>Ciudad:</strong> {Ciudad}</p>
          <p><strong>Teléfono:</strong> {balnearioInfo.telefono}</p>
        </div>
      )}

      {fechaInicio && fechaFin ? (
        <p>
          Mostrando disponibilidad del {new Date(fechaInicio + 'T00:00:00').toLocaleDateString()} al{" "}
          {new Date(fechaFin + 'T00:00:00').toLocaleDateString()}
        </p>
      ) : (
        <p>Por favor selecciona un rango de fechas para ver la disponibilidad.</p>
      )}

      {esDuenio && (
        <>
          <div className="toolbar">
            <div className="toolbar-dropdown">
              <button className="boton-agregar-servicio dropdown-toggle">Agregar elemento ▾</button>
              <div className="dropdown-menu">
                <button className="boton-agregar-servicio" onClick={() => agregarElemento("pasillo")}>Pasillo</button>
                <button className="boton-agregar-servicio" onClick={() => agregarElemento("pileta")}>Pileta</button>
                <button className="boton-agregar-servicio" onClick={() => agregarElemento("quincho")}>Quincho</button>
              </div>
            </div>
            <button className="boton-agregar-servicio" onClick={() => setMostrarAgregarCarpa(true)}>
              Agregar carpa/sombrilla
            </button>
            <Link className="boton-agregar-servicio" to={`/tusreservas/${balnearioInfo?.id_balneario}`}>Tus Reservas</Link>
          </div>
        </>
      )}

      <div
        className="carpa-container"
        ref={containerRef}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        {carpas.map((carpa) => {
          const tipo = getTipoCarpa(carpa);
          const left = carpa.x;
          const top = carpa.y;
          return (
            <div
              key={carpa.id_carpa}
              className={`carpa ${carpaReservada(carpa.id_carpa) ? "reservada" : "libre"} tipo-${tipo}`}
              style={{ left: `${left}px`, top: `${top}px` }}
              onMouseDown={() =>
                esDuenio && setDragging({ tipo: "carpa", id: carpa.id_carpa })
              }
              onClick={() => {
                if (!esDuenio && usuarioLogueado && !carpaReservada(carpa.id_carpa)) {
                  navigate(`/reservaubicacion/${carpa.id_carpa}`);
                }
              }}
              title={`Sillas: ${carpa.cant_sillas ?? "-"}, Mesas: ${carpa.cant_mesas ?? "-"}, Reposeras: ${carpa.cant_reposeras ?? "-"}, Capacidad: ${carpa.capacidad ?? "-"}`}
            >
              <div className="carpa-posicion">{carpa.posicion}</div>
              {tipo === "doble" ? (
                  <FontAwesomeIcon 
                    icon="fa-solid fa-tents" 
                    alt={`Carpa doble ${carpa.posicion}`}
                    className="carpa-imagen"
                    style={{ opacity: carpaReservada(carpa.id_ubicacion) ? 0.6 : 1 }}
                  />
              ) : tipo === "sombrilla" ? (
                <FontAwesomeIcon 
                  icon="fa-solid fa-umbrella-beach"
                  alt={`Sombrilla ${carpa.posicion}`}
                  className="carpa-imagen"
                  style={{ opacity: carpaReservada(carpa.id_ubicacion) ? 0.6 : 1 }}
                />
              ) : (
                <FontAwesomeIcon 
                  icon="fa-solid fa-tent"
                  alt={`Carpa ${carpa.posicion}`}
                  className="carpa-imagen"
                  style={{ opacity: carpaReservada(carpa.id_ubicacion) ? 0.6 : 1 }}
                />
              )}
              <div className="acciones">
                {esDuenio && (
                  <>
                    <button className="boton-agregar-servicio" onClick={() => eliminarCarpa(carpa.id_carpa)}>🗑</button>
                    <button className="boton-agregar-servicio" onClick={() => handleEditarCarpa(carpa)}>✏️</button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {elementos.map((el) => (
          <div
            key={el.id_elemento}
            className={`elemento tipo-${el.tipo}`}
            style={{
              left: `${el.x}px`,
              top: `${el.y}px`,
              transform: `rotate(${el.rotado || 0}deg)`,
              transformOrigin: 'center center',
              position: 'absolute'
            }}
            onMouseDown={() =>
              esDuenio && setDragging({ tipo: "elemento", id: el.id_elemento })
            }
            title={el.tipo}
          >
            {el.tipo}
            {esDuenio && (
              <div className="acciones">
                <button className="boton-agregar-servicio" onClick={() => rotarElemento(el.id_elemento)}>🔄</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SERVICIOS - MOVER ABAJO DE CARPAS Y ARRIBA DE PRECIOS */}
      <div className="iconos-servicios" style={{ marginTop: "2em" }}>
        <h3 className="titulo-servicio">Servicios</h3>
        {balnearioInfo?.servicios?.length > 0 ? (
          <div className="servicios-lista">
            {balnearioInfo.servicios.map((servicio) => (
              <div key={servicio.id_servicio} className="servicio-icono">
                <img src={servicio.imagen} className="icono-imagen" />
                <span>{servicio.nombre}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay servicios cargados para este balneario.</p>
        )}

        {esDuenio && (
          <>
            <button
              className="boton-agregar-servicio"
              onClick={() => setMostrarModalServicios(true)}
            >
              Agrega un Servicio
            </button>

            {mostrarModalServicios && (
              <div className="modal-servicios">
                <div className="modal-content-servicios">
                  <h3>Editar Servicios del Balneario</h3>
                  <div className="servicios-lista">
                    {todosLosServicios.map(serv => {
                      const tieneServicio = balnearioInfo.servicios?.some(s => s.id_servicio === serv.id_servicio);
                      return (
                        <div key={serv.id_servicio} className={`servicio-icono ${tieneServicio ? 'activo' : ''}`}>
                          <img src={serv.imagen} className="icono-imagen" />
                          <span>{serv.nombre}</span>
                          <button
                            className="boton-agregar-servicio"
                            onClick={() => toggleServicio(serv.id_servicio, tieneServicio)}
                          >
                            {tieneServicio ? "Quitar" : "Agregar"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="modal-buttons-servicios">
                    <button className="boton-agregar-servicio" onClick={() => setMostrarModalServicios(false)}>Cerrar</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL AGREGAR CARPA/SOMBRILLA */}
      {mostrarAgregarCarpa && (
        <div className="modal">
          <div className="modal-content">
            <h3>Agregar carpa o sombrilla</h3>
            <label>
              Tipo:
              <select
                value={nuevaCarpa.id_tipo_ubicacion}
                onChange={e => setNuevaCarpa(nc => ({ ...nc, id_tipo_ubicacion: e.target.value }))}
              >
                <option value="">Seleccione tipo</option>
                {tiposUbicacion.map(t =>
                  <option key={t.id_tipo_ubicaciones} value={t.id_tipo_ubicaciones}>{t.nombre}</option>
                )}
              </select>
            </label>
            <label>
              Sillas:
              <input type="number" value={nuevaCarpa.cant_sillas} min={0}
                onChange={e => setNuevaCarpa(nc => ({ ...nc, cant_sillas: +e.target.value }))} />
            </label>
            <label>
              Mesas:
              <input type="number" value={nuevaCarpa.cant_mesas} min={0}
                onChange={e => setNuevaCarpa(nc => ({ ...nc, cant_mesas: +e.target.value }))} />
            </label>
            <label>
              Reposeras:
              <input type="number" value={nuevaCarpa.cant_reposeras} min={0}
                onChange={e => setNuevaCarpa(nc => ({ ...nc, cant_reposeras: +e.target.value }))} />
            </label>
            <label>
              Capacidad:
              <input type="number" value={nuevaCarpa.capacidad} min={1}
                onChange={e => setNuevaCarpa(nc => ({ ...nc, capacidad: +e.target.value }))} />
            </label>
            <div className="modal-buttons">
              <button className="boton-agregar-servicio" onClick={handleAgregarCarpa}>Agregar</button>
              <button className="boton-agregar-servicio" onClick={() => setMostrarAgregarCarpa(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {carpaEditando && (
        <div className="modal">
          <div className="modal-content">
            <h3>Editando Carpa #{carpaEditando.posicion}</h3>
            <label>
              Sillas: <input name="cant_sillas" type="number" value={carpaEditando.cant_sillas || ''} onChange={handleInputChange} />
            </label>
            <label>
              Mesas: <input name="cant_mesas" type="number" value={carpaEditando.cant_mesas || ''} onChange={handleInputChange} />
            </label>
            <label>
              Reposeras: <input name="cant_reposeras" type="number" value={carpaEditando.cant_reposeras || ''} onChange={handleInputChange} />
            </label>
            <label>
              Capacidad: <input name="capacidad" type="number" value={carpaEditando.capacidad || ''} onChange={handleInputChange} />
            </label>
            <div className="modal-buttons">
              <button className="boton-agregar-servicio" onClick={guardarCambios}>Guardar</button>
              <button className="boton-agregar-servicio" onClick={() => setCarpaEditando(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* PRECIOS DEL BALNEARIO */}
      {precios && precios.length > 0 && (
        <div className="precios-balneario-tabla" style={{ marginTop: "2em" }}>
          <h3>Disponibilidad</h3>
          <table className="tabla-precios-reserva">
            <thead>
              <tr>
                <th>Tipo de reserva</th>
                <th>Precio por día</th>
                <th>Precio por semana</th>
                <th>Precio por quincena</th>
                <th>Precio por mes</th>
              </tr>
            </thead>
            <tbody>
              {precios.map(p => (
                <tr key={p.id_tipo_ubicacion}>
                  <td>{p.nombre}</td>
                  <td>${p.dia}</td>
                  <td>${p.semana}</td>
                  <td>${p.quincena}</td>
                  <td>${p.mes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CarpasDelBalneario;