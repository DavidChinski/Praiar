import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import FasesReserva from '../FasesReserva/';
import './ReservaComponent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CARD_WIDTH = 340;
const RESEÑAS_POR_VISTA = 2;
const EXTEND_FACTOR = 100;

function ReservaComponent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // --- Inicialización de ubicaciones seleccionadas SIN duplicados ---
  let id_ubicaciones = [];
  if (location.state?.id_ubicaciones) {
    id_ubicaciones = Array.isArray(location.state.id_ubicaciones)
      ? location.state.id_ubicaciones
      : [location.state.id_ubicaciones];
  }
  if (id) {
    id_ubicaciones = [...id_ubicaciones, id];
  }
  id_ubicaciones = Array.from(new Set(id_ubicaciones.filter(Boolean).map(String)));

  const { fechaInicio: fechaInicioProps, fechaFin: fechaFinProps, id_balneario: id_balnearioProps } = location.state || {};
  const [fechaInicio, setFechaInicio] = useState(fechaInicioProps || "");
  const [fechaSalida, setFechaSalida] = useState(fechaFinProps || "");
  const [id_balneario, setId_balneario] = useState(id_balnearioProps || "");
  const [metodoPago, setMetodoPago] = useState("mercado pago");
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [ubicacionesInfo, setUbicacionesInfo] = useState([]);
  const [balnearioInfo, setBalnearioInfo] = useState(null);
  const [precioTotal, setPrecioTotal] = useState(null);

  // Formulario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [pais, setPais] = useState("");
  const [codigoPais, setCodigoPais] = useState("+54");

  // Mapa/modal
  const [mostrarMapa, setMostrarMapa] = useState(false);

  // Selección definitiva y temporal SIN duplicados
  const [seleccionadas, setSeleccionadas] = useState(id_ubicaciones);
  const [seleccionadasMapa, setSeleccionadasMapa] = useState(seleccionadas);

  const abrirMapa = () => {
    setSeleccionadasMapa(Array.from(new Set(seleccionadas)));
    setMostrarMapa(true);
  };

  // Duración (días completos de estadía)
  const calcularDuracion = () => {
  if (fechaInicio && fechaSalida) {
    const inicio = new Date(fechaInicio);
    const salida = new Date(fechaSalida);
    const diffTime = salida - inicio;
    if (diffTime < 0) return 0;
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
  return 0;
};

  // Traer info de ubicaciones y balneario
  useEffect(() => {
    async function fetchUbicacionesYBalneario() {
      try {
        const ubicaciones = [];
        let balneario = null;
        let balnearioId = id_balneario || balnearioInfo?.id_balneario || null;
        for (const idCarpa of seleccionadas) {
          const res = await fetch(`http://localhost:3000/api/reserva/ubicacion/${idCarpa}`);
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          if (!ubicaciones.find(u => String(u.id_carpa) === String(data.ubicacion.id_carpa))) {
            ubicaciones.push(data.ubicacion);
          }
          if (!balneario) {
            balneario = data.balneario;
            if (!balnearioId) balnearioId = data.balneario.id_balneario;
          }
        }
        setUbicacionesInfo(ubicaciones);
        setBalnearioInfo(balneario);
      } catch (e) {
        setError("Error al cargar datos de las ubicaciones.");
      }
    }
    if (seleccionadas.length > 0) fetchUbicacionesYBalneario();
    else {
      setUbicacionesInfo([]);
      setBalnearioInfo(null);
    }
    // eslint-disable-next-line
  }, [seleccionadas]);

  // Cálculo tradicional de precio con switch (tipo "billetes")
  function calcularPrecioPorDias(dias, precios) {
    let resto = dias;
    let total = 0;
    const mes = Number(precios.mes);
    const quincena = Number(precios.quincena);
    const semana = Number(precios.semana);
    const dia = Number(precios.dia);

    while (resto > 0) {
      switch (true) {
        case resto >= 30:
          total += mes;
          resto -= 30;
          break;
        case resto >= 15:
          total += quincena;
          resto -= 15;
          break;
        case resto >= 7:
          total += semana;
          resto -= 7;
          break;
        default:
          total += dia;
          resto -= 1;
          break;
      }
    }
    return total;
  }

  // Calcular precio total sumando cada ubicación
  useEffect(() => {
    async function fetchPrecios() {
      try {
        const res = await fetch(`http://localhost:3000/api/balneario/${id_balneario}/precios`);
        let preciosBD = await res.json();
        preciosBD = preciosBD.map(p => ({
          ...p,
          id_tipo_ubicacion: p.id_tipo_ubicacion ?? p.id_tipo_ubicaciones
        }));

        const dias = calcularDuracion();
        let total = 0;
        for (const ubic of ubicacionesInfo) {
          const precioTipo = preciosBD.find(
            (p) => String(p.id_tipo_ubicacion) === String(ubic.id_tipo_ubicacion)
          );
          if (precioTipo) {
            total += calcularPrecioPorDias(dias, precioTipo);
          }
        }
        setPrecioTotal(total);
      } catch (e) {
        setPrecioTotal(null);
      }
    }
    fetchPrecios();
    // eslint-disable-next-line
  }, [ubicacionesInfo, balnearioInfo, fechaInicio, fechaSalida]);

  const handleSeleccionarDesdeMapa = (seleccionadasDelMapa) => {
    setSeleccionadas(Array.from(new Set(seleccionadasDelMapa)));
    setMostrarMapa(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    if (!fechaInicio || !fechaSalida) {
      setError("Debes seleccionar una fecha de inicio y una de salida.");
      return;
    }
    if (fechaInicio >= fechaSalida) {
      setError("La fecha de inicio debe ser anterior a la fecha de salida.");
      return;
    }
    if (!nombre.trim() || !apellido.trim() || !email.trim() || !telefono.trim() || !direccion.trim() || !ciudad.trim() || !pais.trim()) {
      setError("Todos los campos marcados con * son obligatorios.");
      return;
    }
    if (seleccionadas.length === 0) {
      setError("Debes seleccionar al menos una ubicación.");
      return;
    }

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || !usuario.auth_id) {
      setError("Debes iniciar sesión para reservar.");
      return;
    }

    const id_balneario_to_send = id_balneario || balnearioInfo?.id_balneario;
    const body = {
      id_usuario: usuario.auth_id,
      id_ubicaciones: seleccionadas,
      id_balneario: id_balneario_to_send,
      fecha_inicio: fechaInicio,
      fecha_salida: fechaSalida,
      metodo_pago: metodoPago,
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim(),
      telefono: codigoPais + telefono.trim(),
      direccion: direccion.trim(),
      ciudad: ciudad.trim(),
      codigo_postal: codigoPostal.trim(),
      pais: pais.trim(),
      precio_total: precioTotal
    };

    try {
      if (metodoPago === 'mercado pago') {
        // Crear preferencia de pago y redirigir a Mercado Pago
        const prefRes = await fetch('http://localhost:3000/api/mercadopago/create-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            descripcion: `Reserva ${balnearioInfo?.nombre || 'Praiar'} ${fechaInicio} - ${fechaSalida}`,
            precio: precioTotal,
            email: email.trim()
          })
        });
        const prefData = await prefRes.json();
        const redirectUrl = prefData?.sandbox_init_point || prefData?.init_point;
        if (!prefRes.ok || !redirectUrl) {
          setError(prefData?.error || 'No se pudo iniciar el pago con Mercado Pago.');
          return;
        }
        // Guardar la reserva pendiente localmente para confirmarla al volver de MP
        localStorage.setItem('reservaPendiente', JSON.stringify(body));
        window.location.href = redirectUrl;
        return;
      } else {
        const response = await fetch("http://localhost:3000/api/reserva", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || "Error al realizar la reserva.");
        } else {
          setExito("Reserva realizada con éxito.");
          setTimeout(() => navigate("/tusreservas/null"), 2000);
        }
      }
    } catch (err) {
      setError("Error de conexión al realizar la reserva.");
    }
  };

  // --- MAPA embebido aquí ---
  const containerRef = useRef(null);
  const [carpas, setCarpas] = useState([]);
  const [elementos, setElementos] = useState([]);
  const [loadingMapa, setLoadingMapa] = useState(true);
  const [reservas, setReservas] = useState([]);
  const [tiposUbicacion, setTiposUbicacion] = useState([]);
  const [balnearioInfoMapa, setBalnearioInfoMapa] = useState(null);

  useEffect(() => {
    let balnearioId = id_balneario || balnearioInfo?.id_balneario;
    if (!balnearioId) return;
    setLoadingMapa(true);

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

    fetch("http://localhost:3000/api/tipos-ubicaciones")
      .then(res => res.json())
      .then(setTiposUbicacion);

    fetch(`http://localhost:3000/api/balneario/${balnearioId}/info`)
      .then(res => res.json())
      .then(setBalnearioInfoMapa);

    setLoadingMapa(false);
  }, [mostrarMapa, id_balneario, balnearioInfo]);

  useEffect(() => {
    let balnearioId = id_balneario || balnearioInfo?.id_balneario;
    if (!fechaInicio || !fechaSalida || !balnearioId) return;
    fetch(`http://localhost:3000/api/balneario/${balnearioId}/reservas?fechaInicio=${fechaInicio}&fechaFin=${fechaSalida}`)
      .then(res => res.json())
      .then(data => setReservas(Array.isArray(data) ? data : []));
  }, [mostrarMapa, id_balneario, balnearioInfo, fechaInicio, fechaSalida]);

  // Obtener el tipo de carpa por id_tipo_ubicacion
  const getTipoCarpa = (carpa) => {
    // Normaliza id_tipo_ubicacion vs id_tipo_ubicaciones
    const tipoId = carpa.id_tipo_ubicacion ?? carpa.id_tipo_ubicaciones;
    return tiposUbicacion.find(t => 
      String(t.id_tipo_ubicacion ?? t.id_tipo_ubicaciones) === String(tipoId)
    )?.nombre || "simple";
  };

  const carpaReservada = (idUbicacion) => {
    if (!fechaInicio || !fechaSalida) return false;
    const inicio = new Date(fechaInicio + 'T00:00:00');
    const fin = new Date(fechaSalida + 'T00:00:00');
    return reservas.some(res => {
      if (String(res.id_ubicacion) !== String(idUbicacion)) return false;
      const resInicio = new Date(res.fecha_inicio + 'T00:00:00');
      const resFin = new Date(res.fecha_salida + 'T00:00:00');
      return resInicio <= fin && resFin >= inicio;
    });
  };

  function handleSeleccionCarpaMapa(id_carpa) {
    setSeleccionadasMapa(prev => {
      const sinDuplicados = prev.filter((x) => x !== undefined && x !== null).map(String);
      if (sinDuplicados.includes(String(id_carpa))) {
        return sinDuplicados.filter(id => id !== String(id_carpa));
      } else {
        return [...sinDuplicados, String(id_carpa)];
      }
    });
  }

  function CarpaVisual({ carpa, tipo, left, top, seleccionadas, setSeleccionadas, soloSeleccion, reservaSeleccionMultiple }) {
    const seleccionada = seleccionadas?.map(String).includes(String(carpa.id_carpa));
    function handleSeleccionClick(e) {
      e.stopPropagation();
      if (!carpaReservada(carpa.id_carpa)) {
        if (seleccionada) {
          setSeleccionadas(seleccionadas.filter(id => String(id) !== String(carpa.id_carpa)));
        } else {
          setSeleccionadas([...seleccionadas, String(carpa.id_carpa)]);
        }
      }
    }
    return (
      <div
        key={carpa.id_carpa}
        className={`carpa ${carpaReservada(carpa.id_carpa) ? "reservada" : "libre"} tipo-${tipo} ${seleccionada ? "seleccionada" : ""}`}
        style={{ left: `${left}px`, top: `${top}px` }}
        onClick={soloSeleccion && reservaSeleccionMultiple ? handleSeleccionClick : undefined}
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
        {soloSeleccion && reservaSeleccionMultiple && (
          <div className="check-seleccion">{seleccionada ? "✅" : "⬜"}</div>
        )}
      </div>
    );
  }

  return (
    <>
      <FasesReserva faseActual={2} />
      <div className="formulario-reserva">
        <div className="informacion-reserva">
          {balnearioInfo && (
            <div className="info-balneario">
              <h4>{balnearioInfo.nombre}</h4>
              <p>{balnearioInfo.direccion}, {balnearioInfo.ciudad_nombre}</p>
            </div>
          )}

          <div className="info-datos-reserva">
            <h4>Los datos de tu reserva</h4>
            <div className="datos-entrada-salida">
              <div className="datos-entrada">
                <h5>Entrada</h5>
                <p className="fecha">{fechaInicio ? new Date(fechaInicio + 'T00:00:00').toLocaleDateString('es-ES') : 'Seleccionar fecha'}</p>
              </div>
              <div className="datos-salida">
                <h5>Salida</h5>
                <p className="fecha">{fechaSalida ? new Date(fechaSalida + 'T00:00:00').toLocaleDateString('es-ES') : 'Seleccionar fecha'}</p>
              </div>
            </div>
            <div className="duracion-estancia">
              <p>Duración total de la estancia:</p>
              <p className="dias">{calcularDuracion()} día{calcularDuracion() !== 1 ? 's' : ''}</p>
            </div>
            <div className="seleccion-carpa">
              <p>Has seleccionado:</p>
              <ul>
                {ubicacionesInfo.map((ubic) =>
                  <li key={ubic.id_carpa}>
                    Ubicación #{ubic.id_carpa} - Capacidad: {ubic.capacidad || 'N/A'}
                  </li>
                )}
              </ul>
              {balnearioInfo && (
                <button
                  type="button"
                  className="btn-desplegar-mapa"
                  onClick={abrirMapa}
                  style={{ marginTop: 10, marginBottom: 10 }}
                >
                  Elegir/editar ubicaciones en el mapa
                </button>
              )}
            </div>
            <div className="precio-reserva">
              <p><b>Precio total:</b> {precioTotal !== null ? `$${precioTotal}` : 'Cargando...'}</p>
            </div>
          </div>
        </div>

        <form className="reserva-form" onSubmit={handleSubmit}>
          <h2>Introduce tus datos</h2>
          <div className="form-group">
            <label>Nombre/s<span className="required-asterisk">*</span>
              <input
                type="text"
                name="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </label>
            <label>Apellido/s<span className="required-asterisk">*</span>
              <input
                type="text"
                name="apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
              />
            </label>
          </div>

          <label>Email<span className="required-asterisk">*</span>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <div className="form-group telefono-group">
            <label>Teléfono<span className="required-asterisk">*</span>
              <div className="telefono-wrapper">
                <select value={codigoPais} onChange={(e) => setCodigoPais(e.target.value)}>
                  <option value="+54">🇦🇷 +54</option>
                </select>
                <input
                  type="tel"
                  name="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                />
              </div>
            </label>
          </div>

          <label>Dirección<span className="required-asterisk">*</span>
            <input
              type="text"
              name="direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              required
            />
          </label>

          <label>Ciudad<span className="required-asterisk">*</span>
            <input
              type="text"
              name="ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              required
            />
          </label>

          <label>Código Postal
            <input
              type="text"
              name="codigo_postal"
              value={codigoPostal}
              onChange={(e) => setCodigoPostal(e.target.value)}
            />
          </label>

          <label>País/región<span className="required-asterisk">*</span>
            <select
              name="pais"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              required
            >
              <option value="">Seleccione un país</option>
              <option value="Argentina">Argentina</option>
              <option value="Brasil">Brasil</option>
              <option value="Chile">Chile</option>
              <option value="Uruguay">Uruguay</option>
              <option value="Paraguay">Paraguay</option>
              <option value="Bolivia">Bolivia</option>
              <option value="Perú">Perú</option>
              <option value="Colombia">Colombia</option>
              <option value="Venezuela">Venezuela</option>
              <option value="Ecuador">Ecuador</option>
            </select>
          </label>

          <label>Método de pago<span className="required-asterisk">*</span>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              required
            >
              <option value="mercado pago">Mercado Pago</option>
              <option value="efectivo">Efectivo</option>
              <option value="debito">Débito</option>
              <option value="credito">Crédito</option>
            </select>
          </label>

          <button type="submit">Reservar</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {exito && <p style={{ color: "green" }}>{exito}</p>}
        </form>
      </div>
      {/* MODAL MAPA: pantalla completa en desktop/mobile */}
      {mostrarMapa && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 1000,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              width: "96vw",
              height: "93vh",
              overflow: "auto",
              position: "relative",
              boxShadow: "0 8px 40px #0006"
            }}
          >
            {/* Botón para cerrar */}
            <button
              className="cerrar-mapa-btn"
              onClick={() => setMostrarMapa(false)}
              aria-label="Cerrar"
            >
            ✕
            </button>
            <h3 style={{ textAlign: "center", fontWeight: 600, marginBottom: 25 }}>Selecciona una o más ubicaciones en el mapa</h3>
            {/* --- Mapa embebido aquí --- */}
            <div
              className="carpa-container"
              ref={containerRef}
              style={{
                minHeight: "70vh",
                minWidth: "80vw",
                position: "relative",
                background: "#e3e3e3",
                borderRadius: "16px",
                margin: "0 auto 20px auto",
                boxShadow: "0 2px 8px #8883"
              }}
            >
              {loadingMapa ? (
                <p>Cargando carpas...</p>
              ) : (
                carpas.map((carpa) => {
                  const tipo = getTipoCarpa(carpa);
                  const left = carpa.x;
                  const top = carpa.y;
                  return (
                    <CarpaVisual
                      key={carpa.id_carpa}
                      carpa={carpa}
                      tipo={tipo}
                      left={left}
                      top={top}
                      seleccionadas={seleccionadasMapa}
                      setSeleccionadas={setSeleccionadasMapa}
                      soloSeleccion={true}
                      reservaSeleccionMultiple={true}
                    />
                  );
                })
              )}
              {elementos.map((el) => (
                <div key={el.id_elemento}
                  style={{
                    position: "absolute",
                    left: el.x ?? 0,
                    top: el.y ?? 0,
                    background: "#fff4",
                    padding: 5,
                    borderRadius: 6
                  }}>
                  {el.tipo}
                </div>
              ))}
            </div>
            <button
              style={{
                marginTop: 25,
                fontWeight: 600,
                fontSize: 18,
                padding: "10px 24px",
                borderRadius: 7,
                background: "#2b87f5",
                color: "#fff",
                border: "none",
                cursor: seleccionadasMapa.length === 0 ? "not-allowed" : "pointer",
                opacity: seleccionadasMapa.length === 0 ? 0.6 : 1,
                display: "block",
                marginLeft: "auto",
                marginRight: "auto"
              }}
              className="btn-aplicar-seleccion"
              onClick={() => handleSeleccionarDesdeMapa(seleccionadasMapa)}
              disabled={seleccionadasMapa.length === 0}
            >
              Elegir {seleccionadasMapa.length} ubicación{seleccionadasMapa.length !== 1 ? "es" : ""}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ReservaComponent;