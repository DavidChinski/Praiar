import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import "./CarpasDelBalneario.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faList, faCog, faSearchPlus, faSearchMinus, faExpandArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import BusquedaHomeSearch from "../../assets/BusquedaHome.png";

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
import ReservaManualModal from "./ReservaManualModal";

const CARD_WIDTH = 340;
const RESEÑAS_POR_VISTA = 2;
const EXTEND_FACTOR = 100;



function CarpasDelBalneario(props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeId } = useParams();
  const balnearioId = props.id ?? location.state?.id ?? routeId;
  const today = new Date();
  const defaultInicio = today.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const defaultFin = tomorrow.toISOString().split('T')[0];

  const [rangoFechas, setRangoFechas] = useState([
    {
      startDate: new Date(props.fechaInicio || location.state?.fechaInicio || defaultInicio),
      endDate: new Date(props.fechaFin || location.state?.fechaFin || defaultFin),
      key: "selection",
    },
  ]);
  const fechaInicio = rangoFechas[0].startDate.toISOString().split('T')[0];
  const fechaFin = rangoFechas[0].endDate.toISOString().split('T')[0];
  const [showCalendarioModal, setShowCalendarioModal] = useState(false);
  const [actualizandoDisponibilidad, setActualizandoDisponibilidad] = useState(false);
  const [rangoFechasDraft, setRangoFechasDraft] = useState(rangoFechas);

  // Selección múltiple: si vienen props de selección, usarlas, sino estado interno
  const [seleccionadas, setSeleccionadas] = props.seleccionadas !== undefined
  ? [props.seleccionadas, props.setSeleccionadas]
  : useState([]);
  

  const containerRef = useRef(null);
  const modalContentRef = useRef(null);
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

  // ==== FUNCIONALIDAD DE ZOOM ====
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Función para hacer zoom in
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom * 1.2, 3));
  };

  // Función para hacer zoom out
  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom / 1.2, 0.3));
  };

  // Función para resetear zoom
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Función para manejar el inicio del arrastre del mapa (solo si no clickea sobre carpa/elemento)
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const target = e.target;
    if (target.closest && (target.closest('.carpa') || target.closest('.elemento'))) {
      return; // no iniciar pan si está sobre un elemento interactivo
    }
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };

  // Función para manejar el movimiento del mouse durante el arrastre
  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  // Función para manejar el fin del arrastre
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Función para manejar el scroll del mouse para zoom
  const handleWheel = (e) => {
    // Solo hacer zoom si mantiene Ctrl presionado; de lo contrario, dejar que la página haga scroll
    if (!e.ctrlKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(3, zoom * delta));
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const zoomRatio = newZoom / zoom;
    setPan(prevPan => ({
      x: mouseX - (mouseX - prevPan.x) * zoomRatio,
      y: mouseY - (mouseY - prevPan.y) * zoomRatio
    }));
    setZoom(newZoom);
  };

  // Nota: ya no prevenimos el scroll por defecto; solo hacemos zoom con Ctrl + rueda.

  // Cerrar modal con tecla ESC
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        setShowCalendarioModal(false);
      }
    }
    if (showCalendarioModal) {
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }
  }, [showCalendarioModal]);

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
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    setUsuarioLogueado(usuario || null);
  }, []);
  // Carrusel infinito
  const [indiceResenia, setIndiceResenia] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Carrusel infinito: arreglo extendido
  const reseñasExtendidas = Array(EXTEND_FACTOR)
    .fill(resenias)
    .flat();
  const baseIndex = resenias.length * Math.floor(EXTEND_FACTOR / 2);


  const [mostrarReservaManual, setMostrarReservaManual] = useState(false);
  const [carpaParaReservar, setCarpaParaReservar] = useState(null);

  function handleReservarManual(carpa) {
    setCarpaParaReservar(carpa);
    setMostrarReservaManual(true);
  }

  async function reservarManual(datosReserva, onComplete) {
    if (!balnearioId || !carpaParaReservar) return;
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    // Armá el body como espera el backend:
    const body = {
      id_usuario: usuario?.auth_id || usuario?.id_usuario || "", // soporte para ambos
      id_ubicaciones: [carpaParaReservar.id_carpa],
      id_balneario: balnearioId,
      fecha_inicio: datosReserva.fecha_inicio,
      fecha_salida: datosReserva.fecha_salida,
      metodo_pago: "manual",
      nombre: datosReserva.nombre,
      apellido: datosReserva.apellido || "",
      email: datosReserva.email,
      telefono: datosReserva.telefono,
      direccion: "",
      ciudad: "",
      codigo_postal: "",
      pais: "",
      precio_total: 0
    };
    // DEBUG: console.log(body);
    const res = await fetch(`http://localhost:3000/api/reserva`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      fetch(`http://localhost:3000/api/balneario/${balnearioId}/reservas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
        .then(res => res.json())
        .then(data => setReservas(Array.isArray(data) ? data : []));
      onComplete();
      alert("Reserva creada con éxito");
    } else {
      const error = await res.json();
      alert(error.error || "Error al crear reserva");
      onComplete();
    }
  }

  useEffect(() => {
    if (resenias.length > 0) {
      setIndiceResenia(baseIndex);
    }
    // eslint-disable-next-line
  }, [resenias.length]);

  // Obtener usuario logueado y balneario info
  useEffect(() => {
    if (!balnearioId) return;
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario && usuario.auth_id) {
      setUsuarioLogueado(true);
      fetch(`http://localhost:3000/api/balneario/${balnearioId}/info`)
        .then(res => res.json())
        .then(info => {
          setBalnearioInfo(info);
          setCiudad(info.ciudad || "");
          if (info.id_usuario === usuario.auth_id) setEsDuenio(true);
        });
    } else {
      setUsuarioLogueado(false);
    }
  }, [balnearioId]);

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
    if (!balnearioId) return;
    const res = await fetch(`http://localhost:3000/api/balneario/${balnearioId}/elemento`, {
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
    if (!balnearioId) return;
    setLoading(true);

    fetch(`http://localhost:3000/api/balneario/${balnearioId}/carpas`)
      .then(res => res.json())
      .then(data => {
        setCarpas(data.map((c, i) => ({
          ...c,
          x: c.x ?? i * 100,
          y: c.y ?? 0,
        })));
      });

    fetch(`http://localhost:3000/api/balneario/${balnearioId}/elementos`)
      .then(res => res.json())
      .then(setElementos);

    fetch(`http://localhost:3000/api/balneario/${balnearioId}/servicios-todos`)
      .then(res => res.json())
      .then(setTodosLosServicios);

    fetch("http://localhost:3000/api/tipos-ubicaciones")
      .then(res => res.json())
      .then(setTiposUbicacion);

    setLoading(false);
  }, [balnearioId]);

  // Cargar reservas
  useEffect(() => {
    if (!fechaInicio || !fechaFin || !balnearioId) return;
    setActualizandoDisponibilidad(true);
    fetch(`http://localhost:3000/api/balneario/${balnearioId}/reservas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`)
      .then(res => res.json())
      .then(data => setReservas(Array.isArray(data) ? data : []))
      .finally(() => setActualizandoDisponibilidad(false));
  }, [balnearioId, fechaInicio, fechaFin]);

  // Cargar precios del balneario
  useEffect(() => {
    if (!balnearioId) return;
    fetch(`http://localhost:3000/api/balneario/${balnearioId}/precios`)
      .then(res => res.json())
      .then(setPrecios);
  }, [balnearioId]);

  // ==== Cargar reseñas ====
  useEffect(() => {
    if (!balnearioId) return;
    setLoadingResenias(true);
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    let url = `http://localhost:3000/api/balneario/${balnearioId}/resenias`;
    if (usuario?.id_usuario) url += `?usuario_id=${usuario.id_usuario}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log('Reseñas cargadas:', data.resenias);
        setResenias(data.resenias || []);
        setLoadingResenias(false);
      })
      .catch(err => {
        setErrorResenias("Error cargando reseñas");
        setLoadingResenias(false);
      });
  }, [balnearioId, usuarioLogueado]);

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
    if (!balnearioId) return;
    if (tiene) {
      await fetch(`http://localhost:3000/api/balneario/${balnearioId}/servicio/${servicioId}`, {
        method: "DELETE"
      });
    } else {
      await fetch(`http://localhost:3000/api/balneario/${balnearioId}/servicio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_servicio: servicioId }),
      });
    }

    fetch(`http://localhost:3000/api/balneario/${balnearioId}/info`)
      .then(res => res.json())
      .then(info => setBalnearioInfo(prev => ({ ...prev, servicios: info.servicios })));
  }

  // ---- RESEÑAS: Agregar reseña ----
  async function agregarResenia() {
    if (!balnearioId) return;
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || !usuario.id_usuario) {
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
      id_usuario: usuario.id_usuario
    };
    const res = await fetch(`http://localhost:3000/api/balneario/${balnearioId}/resenias`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      setReseniaNueva({ comentario: "", estrellas: 5, estrellasHover: undefined });
      // Refrescar lista
      fetch(`http://localhost:3000/api/balneario/${balnearioId}/resenias`)
        .then(r => r.json())
        .then(data => setResenias(data.resenias || []));
    } else {
      alert("Error al enviar reseña");
    }
  }

  // ---- RESEÑAS: Like reseña ----

  async function fetchResenias() {
    if (!balnearioId) return;
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuario'));
    const usuario_id = usuarioGuardado?.id_usuario;
    let url = `http://localhost:3000/api/balneario/${balnearioId}/resenias`;
    if (usuario_id) url += `?usuario_id=${usuario_id}`;
    const res = await fetch(url);
    const data = await res.json();
    setResenias(data.resenias);
  }

  async function likeResenia(id_reseña) {
    if (!balnearioId) return;
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuario'));
    const id_usuario = usuarioGuardado?.id_usuario;
    if (!id_usuario) {
      alert("Debes estar logueado para dar like.");
      return;
    }
    await fetch(`http://localhost:3000/api/resenias/${id_reseña}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario })
    });
    fetchResenias();
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
    if (!balnearioId) return;
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
    if (!balnearioId) return;
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
    if (!balnearioId) return;
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!nuevaCarpa.id_tipo_ubicacion) return alert("Seleccione el tipo");
  
    // Parámetros de la grilla (ajusta si tus carpas son más grandes)
    const STEP_X = 100; // ancho de una carpa
    const STEP_Y = 100; // alto de una carpa
    const MAX_X = 10; // columnas
    const MAX_Y = 10; // filas
  
    // Juntar todas las posiciones ocupadas (carpas y elementos)
    const ocupadas = new Set();
    carpas.forEach(c => {
      const x = Number.isFinite(c.x) ? c.x : 0;
      const y = Number.isFinite(c.y) ? c.y : 0;
      ocupadas.add(`${x},${y}`);
    });
    elementos.forEach(e => {
      const x = Number.isFinite(e.x) ? e.x : 0;
      const y = Number.isFinite(e.y) ? e.y : 0;
      ocupadas.add(`${x},${y}`);
    });
  
    // Buscar la primer celda libre en la grilla
    let libreX = null, libreY = null;
    outer: for (let y = 0; y < MAX_Y; y++) {
      for (let x = 0; x < MAX_X; x++) {
        const key = `${x * STEP_X},${y * STEP_Y}`;
        if (!ocupadas.has(key)) {
          libreX = x * STEP_X;
          libreY = y * STEP_Y;
          break outer;
        }
      }
    }
    if (libreX === null || libreY === null) {
      alert("No hay espacio libre para agregar una nueva carpa/sombrilla.");
      return;
    }
  
    // Crear la carpa en la posición libre encontrada
    const res = await fetch(`http://localhost:3000/api/balneario/${balnearioId}/carpas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...nuevaCarpa,
        id_usuario: usuario.auth_id,
        x: libreX,
        y: libreY
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
      fetch(`http://localhost:3000/api/balneario/${balnearioId}/carpas`)
        .then(res => res.json())
        .then(data => {
          setCarpas(data.map((c, i) => ({
            ...c,
            x: Number.isFinite(c.x) ? c.x : i * STEP_X,
            y: Number.isFinite(c.y) ? c.y : 0,
          })));
        });
    } else {
      alert("Hubo un error al agregar la carpa/sombrilla");
    }
  }

  // --- NUEVO: alta de precio desde modal ---
  async function onAgregarPrecio(precioNuevo) {
    if (!balnearioId) return alert("Falta id de balneario");
    // Si tu backend tiene endpoint POST /api/balneario/:id/precios, usalo:
    const res = await fetch(`http://localhost:3000/api/balneario/${balnearioId}/precios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...precioNuevo,
        id_balneario: balnearioId
      })
    });
    if (res.ok) {
      fetch(`http://localhost:3000/api/balneario/${balnearioId}/precios`)
        .then(res => res.json())
        .then(setPrecios);
    } else {
      alert("Error al agregar precio.");
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
    if (!balnearioId) return;
    const p = editandoPrecio;
    const res = await fetch(
      `http://localhost:3000/api/balneario/${balnearioId}/precios/${p.id_tipo_ubicacion}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(precioEdit),
      }
    );
    if (res.ok) {
      fetch(`http://localhost:3000/api/balneario/${balnearioId}/precios`)
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
      <div className="balneario-header">
        <div className="balneario-header-main">
          <h1 className="balneario-nombre">{balnearioInfo?.nombre || 'Balneario'}</h1>

          <div className="header-badge">
            {esDuenio ? (
              <span>TU BALNEARIO!</span>
            ) : (
              <span>RESERVA YA!</span>
            )}
          </div>
        </div>
        {balnearioInfo && (
          <div className="balneario-meta">
            <div className="meta-item">
              <span className="meta-label">Dirección</span>
              <span className="meta-value">{balnearioInfo.direccion || '-'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Ciudad</span>
              <span className="meta-value">{Ciudad || '-'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Teléfono</span>
              <a className="meta-value meta-link" href={balnearioInfo.telefono ? `tel:${balnearioInfo.telefono}` : undefined}>{balnearioInfo.telefono || '-'}</a>
            </div>
          </div>
        )}
      </div>

      <div className="main-content-layout">
        {/* Panel izquierdo con elementos de gestión */}
        <div className="management-panel">
          {/* Indicador de estado del sistema */}
          <div className="system-status">
            <div className="status-indicator active"></div>
            {esDuenio ? (
              <span className="status-text">Tu panel de control</span>
            ) : (
              <span className="status-text">Edita la fecha!</span>
            )}
          </div>
          
          {esDuenio ? (
            <>
              {/* Sección de Gestión de Fechas */}
              <div className="panel-section">
                <h3 className="panel-title">Gestión de Fechas</h3>
                <div className="availability-row">
                  <div className="availability-info">
                    <p>
                      Mostrando disponibilidad del {new Date(fechaInicio + 'T00:00:00').toLocaleDateString('es-ES')} al {new Date(fechaFin + 'T00:00:00').toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="availability-actions">
                    <button
                      className="cambiar-fecha-btn"
                      onClick={() => {
                        setShowCalendarioModal(true);
                        setRangoFechasDraft(rangoFechas);
                      }}
                      disabled={actualizandoDisponibilidad}
                    >
                      Cambiar Fecha
                    </button>
                  </div>
                </div>
              </div>

              {/* Sección de Gestión de Elementos */}
              <div className="panel-section">
                <h3 className="panel-title">Gestión de Elementos</h3>
                <div className="add-elements-container">
                  <div className="element-input-group">
                    <label className="subtitulo">Tipo de elemento</label>
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
                  <button className="panel-button primary" onClick={() => setMostrarAgregarCarpa(true)}>
                    <FontAwesomeIcon icon={faPlus} /> Agregar Carpa/Sombrilla
                  </button>
                </div>
              </div>

              {/* Sección de Acciones del Sistema */}
              <div className="panel-section">
                <h3 className="panel-title">Acciones del Sistema</h3>
                <div className="quick-actions">
                  <Link className="panel-button secondary" to={`/tusreservas/${balnearioInfo?.id_balneario}`}>
                    <FontAwesomeIcon icon={faList} /> Ver Reservas
                  </Link>
                  <button className="panel-button secondary" onClick={() => setMostrarModalServicios(true)}>
                    <FontAwesomeIcon icon={faCog} /> Gestionar Servicios
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="panel-section">
              <h3 className="panel-title">Información de Disponibilidad</h3>
              <div className="availability-row">
                <div className="availability-info">
                  <p>
                    Mostrando disponibilidad del {new Date(fechaInicio + 'T00:00:00').toLocaleDateString('es-ES')} al {new Date(fechaFin + 'T00:00:00').toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="availability-actions">
                  <button
                    className="cambiar-fecha-btn"
                    onClick={() => {
                      setShowCalendarioModal(true);
                      setRangoFechasDraft(rangoFechas);
                    }}
                    disabled={actualizandoDisponibilidad}
                  >
                    Cambiar Fecha
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contenedor del mapa a la derecha */}
        <div className="map-container-wrapper">
          {actualizandoDisponibilidad && (
            <div className="map-loading-overlay">
              <div className="spinner" />
              <span>Actualizando disponibilidad…</span>
            </div>
          )}
          {/* Leyenda del mapa */}
          <div className="map-legend">
            <div className="legend-item"><span className="legend-dot libre" /> Disponible</div>
            <div className="legend-item"><span className="legend-dot reservada" /> Reservado</div>
          </div>
          {/* Controles de zoom */}
          
          
          <div
            className="carpa-container"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div
              className="map-canvas"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0'
              }}
            >
            {carpas.map((carpa) => {
              const tipo = getTipoCarpa(carpa);
              const left = carpa.x;
              const top = carpa.y;
              return (
                <div
                  key={carpa.id_carpa}
                  className="carpa-wrapper"
                  style={{ position: "absolute", left, top, zIndex: 1 }}
                >
                  <CarpaItem
                    carpa={carpa}
                    tipo={tipo}
                    left={0}
                    top={0}
                    esDuenio={esDuenio}
                    dragging={dragging}
                    setDragging={setDragging}
                    carpaReservada={carpaReservada}
                    usuarioLogueado={usuarioLogueado}
                    navigate={navigate}
                    eliminarCarpa={eliminarCarpa}
                    handleEditarCarpa={handleEditarCarpa}
                    fechaInicio={fechaInicio}
                    fechaFin={fechaFin}
                    idBalneario={balnearioId}
                    seleccionadas={seleccionadas}
                    setSeleccionadas={setSeleccionadas}
                    soloSeleccion={props.soloSeleccion}
                    reservaSeleccionMultiple={props.reservaSeleccionMultiple}
                    onReservarManual={esDuenio ? handleReservarManual : undefined}
                  />
                </div>
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
          </div>
        </div>
      </div>

      {showCalendarioModal && (
        <div
          className="modal-fechas"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            // cerrar si clickea fuera del contenido
            if (modalContentRef.current && !modalContentRef.current.contains(e.target)) {
              setShowCalendarioModal(false);
            }
          }}
        >
          <div className="modal-fechas-content" ref={modalContentRef} onMouseDown={(e) => e.stopPropagation()}>
            <button
              className="modal-fechas-close"
              aria-label="Cerrar"
              onClick={() => setShowCalendarioModal(false)}
            >
              ✕
            </button>
            <h3 className="modal-fechas-title">Selecciona tu rango de fechas</h3>
            <DateRange
              editableDateInputs={true}
              onChange={(item) => setRangoFechasDraft([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={rangoFechasDraft}
              months={2}
              direction="horizontal"
              rangeColors={["#005984"]}
              minDate={new Date()}
            />
            <div className="modal-fechas-actions">
              <button
                className="panel-button primary"
                onClick={() => {
                  setRangoFechas(rangoFechasDraft);
                  setShowCalendarioModal(false);
                }}
                disabled={actualizandoDisponibilidad}
              >
                Aceptar
              </button>
              <button
                className="panel-button secondary"
                onClick={() => setShowCalendarioModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <ServiciosSection
        balnearioInfo={balnearioInfo}
        esDuenio={esDuenio}
        mostrarModalServicios={mostrarModalServicios}
        setMostrarModalServicios={setMostrarModalServicios}
        todosLosServicios={todosLosServicios}
        toggleServicio={toggleServicio}
      />

      <AgregarCarpaModal
        mostrarAgregarCarpa={mostrarAgregarCarpa}
        setMostrarAgregarCarpa={setMostrarAgregarCarpa}
        nuevaCarpa={nuevaCarpa}
        setNuevaCarpa={setNuevaCarpa}
        tiposUbicacion={tiposUbicacion}
        handleAgregarCarpa={handleAgregarCarpa}
        precios={precios}
        onAgregarPrecio={onAgregarPrecio}
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
      <ReservaManualModal
        mostrar={mostrarReservaManual}
        setMostrar={setMostrarReservaManual}
        carpa={carpaParaReservar}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        onReservar={reservarManual}
      />
    </div>
  );
}

export default CarpasDelBalneario;