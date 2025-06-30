import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import "./CarpasDelBalneario.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// NUEVOS COMPONENTES
import ElementoAutocomplete from "./ElementoAutocomplete";
import CarpaItem from "./CarpaItem";
import ElementoItem from "./ElementoItem";
import ServiciosSection from "./ServiciosSection";
import ReseniasSection from "./ReseniasSection";
import AgregarCarpaModal from "./AgregarCarpaModal";
import EditarCarpaModal from "./EditarCarpaModal";
import PreciosBalnearioTabla from "./PreciosBalnearioTabla";
import EditarPrecioModal from "./EditarPrecioModal";

const CARD_WIDTH = 340;
const RESEÑAS_POR_VISTA = 2;
const EXTEND_FACTOR = 100;

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
  const [editandoPrecio, setEditandoPrecio] = useState(null);
  const [precioEdit, setPrecioEdit] = useState({
    dia: "",
    semana: "",
    quincena: "",
    mes: "",
  });
  const navigate = useNavigate();

  // AUTOCOMPLETADO DE ELEMENTOS
  const [todosElementos] = useState([
    { nombre: "Pasillo", tipo: "pasillo" },
    { nombre: "Pileta", tipo: "pileta" },
    { nombre: "Quincho", tipo: "quincho" }
  ]);
  const [elementoInput, setElementoInput] = useState("");
  const [elementoMatches, setElementoMatches] = useState([]);
  const elementoInputRef = useRef(null);
  const elementoDropdownRef = useRef(null);

  // ==== RESEÑAS ====
  const [resenias, setResenias] = useState([]);
  const [loadingResenias, setLoadingResenias] = useState(false);
  const [errorResenias, setErrorResenias] = useState(null);
  const [reseniaNueva, setReseniaNueva] = useState({ comentario: "", estrellas: 5, estrellasHover: undefined });

  // Carrusel infinito
  const [indiceResenia, setIndiceResenia] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Carrusel infinito: arreglo extendido
  const reseñasExtendidas = Array(EXTEND_FACTOR)
    .fill(resenias)
    .flat();
  const baseIndex = resenias.length * Math.floor(EXTEND_FACTOR / 2);

  useEffect(() => {
    if (resenias.length > 0) {
      setIndiceResenia(baseIndex);
    }
    // eslint-disable-next-line
  }, [resenias.length]);

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

  useEffect(() => {
    if (!elementoInput) {
      setElementoMatches([]);
      return;
    }
    const normalizar = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const inputNorm = normalizar(elementoInput);
    const matches = todosElementos.filter(e =>
      normalizar(e.nombre).startsWith(inputNorm)
    );
    setElementoMatches(matches);
  }, [elementoInput, todosElementos]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (elementoDropdownRef.current && !elementoDropdownRef.current.contains(event.target)) {
        setElementoMatches([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function agregarElementoTipo(tipo) {
    const res = await fetch(`http://localhost:3000/api/balneario/${id}/elemento`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo }),
    });
    const data = await res.json();
    setElementos((prev) => [...prev, data]);
    setElementoInput("");
    setElementoMatches([]);
  }

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

  // ==== Cargar reseñas ====
  useEffect(() => {
    setLoadingResenias(true);
    fetch(`http://localhost:3000/api/balneario/${id}/resenias`)
      .then(res => res.json())
      .then(data => {
        setResenias(data.resenias || []);
        setLoadingResenias(false);
      })
      .catch(err => {
        setErrorResenias("Error cargando reseñas");
        setLoadingResenias(false);
      });
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

  // ---- RESEÑAS: Agregar reseña ----
  async function agregarResenia() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || !usuario.auth_id) {
      alert("Debes iniciar sesión para dejar una reseña.");
      return;
    }
    if (!reseniaNueva.comentario.trim()) {
      alert("Por favor escribe un comentario.");
      return;
    }
    if (!reseniaNueva.estrellas || isNaN(reseniaNueva.estrellas) || reseniaNueva.estrellas < 1 || reseniaNueva.estrellas > 5) {
      alert("Selecciona una cantidad de estrellas válida.");
      return;
    }
    const body = {
      comentario: reseniaNueva.comentario,
      estrellas: Number(reseniaNueva.estrellas),
      id_usuario: usuario.id_usuario // puede venir como id_usuario o auth_id
    };
    const res = await fetch(`http://localhost:3000/api/balneario/${id}/resenias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setReseniaNueva({ comentario: "", estrellas: 5, estrellasHover: undefined });
      // Refrescar lista
      fetch(`http://localhost:3000/api/balneario/${id}/resenias`)
        .then(r => r.json())
        .then(data => setResenias(data.resenias || []));
    } else {
      alert("Error al enviar reseña");
    }
  }

  // ---- RESEÑAS: Like reseña ----
  async function likeResenia(id_reseña) {
    const res = await fetch(`http://localhost:3000/api/resenias/${id_reseña}/like`, { method: "POST" });
    if (res.ok) {
      setResenias(resenias => resenias.map(r =>
        r.id_reseña === id_reseña ? { ...r, likes: (r.likes || 0) + 1 } : r
      ));
    }
  }

  // Carrusel infinito handlers
  function handleAvanzarResenias() {
    if (animating) return;
    setAnimating(true);
    setIndiceResenia(prev => prev + 1);
  }
  function handleRetrocederResenias() {
    if (animating) return;
    setAnimating(true);
    setIndiceResenia(prev => prev - 1);
  }
  function handleTransitionEnd() {
    setAnimating(false);
    if (resenias.length === 0) return;
    if (indiceResenia <= resenias.length - 1) {
      setIndiceResenia(baseIndex + (indiceResenia % resenias.length));
    } else if (indiceResenia >= reseñasExtendidas.length - RESEÑAS_POR_VISTA) {
      setIndiceResenia(baseIndex + ((indiceResenia - baseIndex) % resenias.length));
    }
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

  // ---- NUEVO: edición de precios ----
  function abrirModalPrecio(p) {
    setEditandoPrecio(p);
    setPrecioEdit({
      dia: p.dia,
      semana: p.semana,
      quincena: p.quincena,
      mes: p.mes,
    });
  }

  async function guardarPrecio() {
    const p = editandoPrecio;
    const res = await fetch(
      `http://localhost:3000/api/balneario/${id}/precios/${p.id_tipo_ubicacion}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(precioEdit),
      }
    );
    if (res.ok) {
      fetch(`http://localhost:3000/api/balneario/${id}/precios`)
        .then(res => res.json())
        .then(setPrecios);
      setEditandoPrecio(null);
    } else {
      alert("Error al guardar precio.");
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
        <div className="toolbar">
          <div style={{ minWidth: 250 }}>
            <label className="subtitulo" style={{ marginBottom: 4, display: "block" }}>
              Agregar elemento
            </label>
            <ElementoAutocomplete
              elementoInput={elementoInput}
              setElementoInput={setElementoInput}
              elementoMatches={elementoMatches}
              setElementoMatches={setElementoMatches}
              agregarElementoTipo={agregarElementoTipo}
              elementoInputRef={elementoInputRef}
              elementoDropdownRef={elementoDropdownRef}
            />
          </div>
          <button className="boton-agregar-servicio" onClick={() => setMostrarAgregarCarpa(true)}>
            Agregar carpa/sombrilla
          </button>
          <Link className="boton-agregar-servicio" to={`/tusreservas/${balnearioInfo?.id_balneario}`}>Tus Reservas</Link>
        </div>
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
            <CarpaItem
              key={carpa.id_carpa}
              carpa={carpa}
              tipo={tipo}
              left={left}
              top={top}
              esDuenio={esDuenio}
              dragging={dragging}
              setDragging={setDragging}
              carpaReservada={carpaReservada}
              usuarioLogueado={usuarioLogueado}
              navigate={navigate}
              eliminarCarpa={eliminarCarpa}
              handleEditarCarpa={handleEditarCarpa}
            />
          );
        })}

        {elementos.map((el) => (
          <ElementoItem
            key={el.id_elemento}
            el={el}
            esDuenio={esDuenio}
            setDragging={setDragging}
            rotarElemento={rotarElemento}
          />
        ))}
      </div>

      <ServiciosSection
        balnearioInfo={balnearioInfo}
        esDuenio={esDuenio}
        mostrarModalServicios={mostrarModalServicios}
        setMostrarModalServicios={setMostrarModalServicios}
        todosLosServicios={todosLosServicios}
        toggleServicio={toggleServicio}
      />

      <ReseniasSection
        loadingResenias={loadingResenias}
        handleRetrocederResenias={handleRetrocederResenias}
        handleAvanzarResenias={handleAvanzarResenias}
        indiceResenia={indiceResenia}
        animating={animating}
        handleTransitionEnd={handleTransitionEnd}
        reseñasExtendidas={reseñasExtendidas}
        CARD_WIDTH={CARD_WIDTH}
        RESEÑAS_POR_VISTA={RESEÑAS_POR_VISTA}
        likeResenia={likeResenia}
        usuarioLogueado={usuarioLogueado}
        esDuenio={esDuenio}
        reseniaNueva={reseniaNueva}
        setReseniaNueva={setReseniaNueva}
        agregarResenia={agregarResenia}
      />

      <AgregarCarpaModal
        mostrarAgregarCarpa={mostrarAgregarCarpa}
        setMostrarAgregarCarpa={setMostrarAgregarCarpa}
        nuevaCarpa={nuevaCarpa}
        setNuevaCarpa={setNuevaCarpa}
        tiposUbicacion={tiposUbicacion}
        handleAgregarCarpa={handleAgregarCarpa}
      />

      <EditarCarpaModal
        carpaEditando={carpaEditando}
        handleInputChange={handleInputChange}
        guardarCambios={guardarCambios}
        setCarpaEditando={setCarpaEditando}
      />

      <PreciosBalnearioTabla
        precios={precios}
        esDuenio={esDuenio}
        abrirModalPrecio={abrirModalPrecio}
      />

      <EditarPrecioModal
        editandoPrecio={editandoPrecio}
        precioEdit={precioEdit}
        setPrecioEdit={setPrecioEdit}
        guardarPrecio={guardarPrecio}
        setEditandoPrecio={setEditandoPrecio}
      />
    </div>
  );
}

export default CarpasDelBalneario;