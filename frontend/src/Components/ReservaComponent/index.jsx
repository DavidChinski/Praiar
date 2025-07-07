import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import FasesReserva from '../FasesReserva/';
import './ReservaComponent.css';

function ReservaComponent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // CORREGIDO: Maneja ambos casos, por state o por URL
  let id_ubicaciones = [];
  if (location.state?.id_ubicaciones) {
    id_ubicaciones = Array.isArray(location.state.id_ubicaciones)
      ? location.state.id_ubicaciones
      : [location.state.id_ubicaciones];
  } else if (id) {
    id_ubicaciones = [id];
  }

  const { fechaInicio: fechaInicioProps, fechaFin: fechaFinProps } = location.state || {};

  const [fechaInicio, setFechaInicio] = useState(fechaInicioProps || "");
  const [fechaSalida, setFechaSalida] = useState(fechaFinProps || "");
  const [metodoPago, setMetodoPago] = useState("mercado pago");
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [ubicacionesInfo, setUbicacionesInfo] = useState([]);
  const [balnearioInfo, setBalnearioInfo] = useState(null);

  // Precio total para varias ubicaciones
  const [precioTotal, setPrecioTotal] = useState(null);

  // Campos del formulario
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [pais, setPais] = useState("");
  const [codigoPais, setCodigoPais] = useState("+54");

  // Duración
  const calcularDuracion = () => {
    if (fechaInicio && fechaSalida) {
      const inicio = new Date(fechaInicio);
      const salida = new Date(fechaSalida);
      const diffTime = Math.abs(salida - inicio);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  };

  // Traer info de ubicaciones y balneario (todas las ubicaciones deben ser del mismo balneario)
  useEffect(() => {
    async function fetchUbicacionesYBalneario() {
      try {
        const ubicaciones = [];
        let balneario = null;
        for (const id of id_ubicaciones) {
          const res = await fetch(`http://localhost:3000/api/reserva/ubicacion/${id}`);
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          ubicaciones.push(data.ubicacion);
          if (!balneario) balneario = data.balneario;
        }
        setUbicacionesInfo(ubicaciones);
        setBalnearioInfo(balneario);
      } catch (e) {
        setError("Error al cargar datos de las ubicaciones.");
      }
    }
    if (id_ubicaciones.length > 0) fetchUbicacionesYBalneario();
  }, [id_ubicaciones]);

  // Calcular precio total sumando cada ubicación
  useEffect(() => {
    async function fetchPrecios() {
      if (!balnearioInfo || ubicacionesInfo.length === 0) {
        setPrecioTotal(null);
        return;
      }
      try {
        const res = await fetch(`http://localhost:3000/api/balneario/${balnearioInfo.id_balneario}/precios`);
        const preciosBD = await res.json();
        const dias = calcularDuracion();
        let total = 0;

        for (const ubic of ubicacionesInfo) {
          const precioTipo = preciosBD.find(
            (p) => String(p.id_tipo_ubicacion) === String(ubic.id_tipo_ubicacion)
          );
          if (precioTipo) {
            let resto = dias;
            const mes = Number(precioTipo.mes);
            const quincena = Number(precioTipo.quincena);
            const semana = Number(precioTipo.semana);
            const dia = Number(precioTipo.dia);

            let cantidadMeses = Math.floor(resto / 30);
            total += cantidadMeses * mes;
            resto = resto % 30;

            let cantidadQuincenas = Math.floor(resto / 15);
            total += cantidadQuincenas * quincena;
            resto = resto % 15;

            let cantidadSemanas = Math.floor(resto / 7);
            total += cantidadSemanas * semana;
            resto = resto % 7;

            let cantidadDias = resto;
            total += cantidadDias * dia;
          }
        }
        setPrecioTotal(total);
      } catch (e) {
        setPrecioTotal(null);
      }
    }
    fetchPrecios();
  }, [ubicacionesInfo, balnearioInfo, fechaInicio, fechaSalida]);

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
    if (id_ubicaciones.length === 0) {
      setError("Debes seleccionar al menos una ubicación.");
      return;
    }

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || !usuario.auth_id) {
      setError("Debes iniciar sesión para reservar.");
      return;
    }

    const id_balneario = balnearioInfo?.id_balneario;
    const body = {
      id_usuario: usuario.auth_id,
      id_ubicaciones: id_ubicaciones, // array!
      id_balneario,
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
    } catch (err) {
      setError("Error de conexión al realizar la reserva.");
    }
  };

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
    </>
  );
}

export default ReservaComponent;