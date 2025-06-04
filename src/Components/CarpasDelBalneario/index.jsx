import { useEffect, useState, useRef } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { Link } from "react-router-dom";

import "./CarpasDelBalneario.css";
import Carpa from '../../assets/Carpa.png';

function CarpasDelBalneario() {
  const { id } = useParams();
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

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUsuarioLogueado(false);
        setLoading(false);
        return;
      }

      setUsuarioLogueado(true);

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("*")
        .eq("auth_id", user.id)
        .single();

      if (!usuario) {
        setLoading(false);
        return;
      }

      const { data: balnearioData } = await supabase
        .from("balnearios")
        .select("*")
        .eq("id_balneario", id)
        .single();

      let ciudadNombre = "";
      if (balnearioData?.id_ciudad) {
        const { data: ciudadData } = await supabase
          .from("ciudades")
          .select("nombre")
          .eq("id_ciudad", balnearioData.id_ciudad)
          .single();
        ciudadNombre = ciudadData?.nombre || "";
      }
      setCiudad(ciudadNombre);

      const { data: todos } = await supabase
      .from("servicios")
      .select("id_servicio, nombre, imagen");
    setTodosLosServicios(todos || []);


      // 🔄 Obtener servicios
      const { data: relaciones } = await supabase
        .from("balnearios_servicios")
        .select("id_servicio")
        .eq("id_balneario", id);


      const idsServicios = relaciones?.map(r => r.id_servicio) || [];

      const { data: servicios } = await supabase
        .from("servicios")
        .select("id_servicio, nombre, imagen")
        .in("id_servicio", idsServicios);
      

      if (balnearioData?.id_usuario === usuario.auth_id) {
        setEsDuenio(true);
      }

      // 🔄 Guardamos balneario con servicios incluidos
      setBalnearioInfo({ ...balnearioData, servicios });

      const { data: carpasData } = await supabase
        .from("ubicaciones")
        .select("*")
        .eq("id_balneario", id);

      const carpasConPos = carpasData.map((c, i) => ({
        ...c,
        x: c.x ?? i * 100,
        y: c.y ?? 0,
      }));
      setCarpas(carpasConPos);

      const { data: elementosData } = await supabase
        .from("elementos_ubicacion")
        .select("*")
        .eq("id_balneario", id);

      setElementos(elementosData);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  async function toggleServicio(servicioId, tiene) {
    if (tiene) {
      await supabase
      .from("balnearios_servicios")
      .delete()
      .match({ id_balneario: Number(id), id_servicio: Number(servicioId) });
    } else {
      await supabase
      .from("balnearios_servicios")
      .insert({ id_balneario: Number(id), id_servicio: Number(servicioId) });
    }

    // Volver a cargar servicios actualizados
    const { data: relacionesActualizadas } = await supabase
      .from("balnearios_servicios")
      .select("id_servicio")
      .eq("id_balneario", id);
    const idsServicios = relacionesActualizadas?.map(r => r.id_servicio) || [];

    const { data: serviciosActualizados } = await supabase
      .from("servicios")
      .select("id_servicio, nombre, imagen")
      .in("id_servicio", idsServicios);

    setBalnearioInfo(prev => ({ ...prev, servicios: serviciosActualizados }));
  }


  async function agregarElemento(tipo) {
    const x = 100, y = 100;
    const { data } = await supabase
      .from("elementos_ubicacion")
      .insert({ id_balneario: id, tipo, x, y })
      .select()
      .single();

    if (data) {
      setElementos((prev) => [...prev, data]);
    }
  }

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
        await supabase
          .from("ubicaciones")
          .update({ x: carpa.x, y: carpa.y })
          .eq("id_carpa", carpa.id_carpa);
      }
    } else if (dragging.tipo === "elemento") {
      const el = elementos.find((el) => el.id_elemento === dragging.id);
      if (el) {
        await supabase
          .from("elementos_ubicacion")
          .update({ x: el.x, y: el.y })
          .eq("id_elemento", el.id_elemento);
      }
    }

    setDragging(null);
  }

  async function eliminarCarpa(id_carpa) {
    const { error } = await supabase.from("ubicaciones").delete().eq("id_carpa", id_carpa);
    if (!error) {
      setCarpas((prev) => prev.filter((carpa) => carpa.id_carpa !== id_carpa));
    }
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
    const { error } = await supabase
      .from("ubicaciones")
      .update(datos)
      .eq("id_carpa", id_carpa);

    if (!error) {
      setCarpas((prev) =>
        prev.map((c) => (c.id_carpa === id_carpa ? { ...c, ...datos } : c))
      );
      setCarpaEditando(null);
    }
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
      supabase
        .from("elementos_ubicacion")
        .update({ rotado: (el.rotado || 0) + 90 })
        .eq("id_elemento", id_elemento);
    }
  }

  if (loading) return <p>Cargando carpas...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="carpas-del-balneario">
      <h2>{balnearioInfo.nombre}</h2>

      {balnearioInfo && (
        <div className="balneario-info">
          <p><strong>Dirección:</strong> {balnearioInfo.direccion}</p>
          <p><strong>Ciudad:</strong> {Ciudad}</p>
          <p><strong>Teléfono:</strong> {balnearioInfo.telefono}</p>
        </div>
      )}
      <div className="iconos-servicios">
        <h3>Servicios</h3>

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
                      const tieneServicio = balnearioInfo.servicios.some(s => s.id_servicio === serv.id_servicio);
                      return (
                        <div key={serv.id_servicio} className={`servicio-icono ${tieneServicio ? 'activo' : ''}`}>
                          <img src={serv.imagen} className="icono-imagen" />
                          <span>{serv.nombre}</span>
                          <button
                            onClick={() => toggleServicio(serv.id_servicio, tieneServicio)}
                          >
                            {tieneServicio ? "Quitar" : "Agregar"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="modal-buttons-servicios">
                    <button onClick={() => setMostrarModalServicios(false)}>Cerrar</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
    </div>




      {esDuenio && (
        <>
          <div className="toolbar-dropdown">
            <button className="dropdown-toggle">Agregar elemento ▾</button>
            <div className="dropdown-menu">
              <button onClick={() => agregarElemento("pasillo")}>Pasillo</button>
              <button onClick={() => agregarElemento("pileta")}>Pileta</button>
              <button onClick={() => agregarElemento("quincho")}>Quincho</button>
            </div>
          </div>
          <Link to={`/tusreservas/${balnearioInfo.id_balneario}`}>Tus Reservas</Link>
        </>
      )}

      <div
        className="carpa-container"
        ref={containerRef}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        {carpas.map((carpa) => (
          <div
            key={carpa.id_carpa}
            className={`carpa ${carpa.reservado ? "reservada" : "libre"}`}
            style={{ left: `${carpa.x}px`, top: `${carpa.y}px` }}
            onMouseDown={() =>
              esDuenio && setDragging({ tipo: "carpa", id: carpa.id_carpa })
            }
            onClick={() => {
              if (!esDuenio && usuarioLogueado) {
                navigate(`/reservaubicacion/${carpa.id_carpa}`);
              }
            }}
            title={`Sillas: ${carpa.cant_sillas ?? "-"}, Mesas: ${carpa.cant_mesas ?? "-"}, Reposeras: ${carpa.cant_reposeras ?? "-"}, Capacidad: ${carpa.capacidad ?? "-"}`}
          >
            <div className="carpa-posicion">{carpa.posicion}</div>
            <img
              src={Carpa}
              alt={`Carpa ${carpa.posicion}`}
              className="carpa-imagen"
            />
            <div className="acciones">
              {esDuenio && (
                <>
                  <button onClick={() => eliminarCarpa(carpa.id_carpa)}>🗑</button>
                  <button onClick={() => handleEditarCarpa(carpa)}>✏️</button>
                </>
              )}
            </div>
          </div>
        ))}

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
                <button onClick={() => rotarElemento(el.id_elemento)}>🔄</button>
              </div>
            )}
          </div>
        ))}
      </div>

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
              <button onClick={guardarCambios}>Guardar</button>
              <button onClick={() => setCarpaEditando(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CarpasDelBalneario;
