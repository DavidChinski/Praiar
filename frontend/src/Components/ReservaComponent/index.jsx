import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import FasesReserva from '../FasesReserva/';
import './ReservaComponent.css';

function ReservaComponent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const id_ubicacion = id;

  // Obtener fechas del location state (enviadas desde CarpasDelBalneario)
  const { fechaInicio: fechaInicioProps, fechaFin: fechaFinProps } = location.state || {};

  const [fechaInicio, setFechaInicio] = useState(fechaInicioProps || "");
  const [fechaSalida, setFechaSalida] = useState(fechaFinProps || "");
  const [metodoPago, setMetodoPago] = useState("mercado pago");
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [ubicacionInfo, setUbicacionInfo] = useState(null);
  const [balnearioInfo, setBalnearioInfo] = useState(null);

  // Para mostrar precio total
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

  // Función para calcular la duración de la estancia
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

  // Cargar info de la ubicación y balneario desde el backend
  useEffect(() => {
    fetch(`http://localhost:3000/api/reserva/ubicacion/${id_ubicacion}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setUbicacionInfo(data.ubicacion);
          setBalnearioInfo(data.balneario);
        }
      })
      .catch(() => setError("Error al obtener datos de la ubicación."));
  }, [id_ubicacion]);

  // Cargar y calcular precio total
  useEffect(() => {
    const fetchPrecios = async () => {
      if (!balnearioInfo || !ubicacionInfo) {
        setPrecioTotal(null);
        return;
      }
      try {
        const res = await fetch(`http://localhost:3000/api/balneario/${balnearioInfo.id_balneario}/precios`);
        const preciosBD = await res.json();
        // buscar el precio para este tipo de ubicación
        const precioTipo = preciosBD.find(
          (p) => String(p.id_tipo_ubicacion) === String(ubicacionInfo.id_tipo_ubicacion)
        );
        if (precioTipo) {
          const dias = calcularDuracion();
          let total = 0;
          let resto = dias;

          // Suma por meses
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

          setPrecioTotal(total);
        } else {
          setPrecioTotal(null);
        }
      } catch (e) {
        setPrecioTotal(null);
      }
    };
    fetchPrecios();
  }, [ubicacionInfo, balnearioInfo, fechaInicio, fechaSalida]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    // Validaciones
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

    // Usuario del localStorage
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || !usuario.auth_id) {
      setError("Debes iniciar sesión para reservar.");
      return;
    }

    const id_balneario = ubicacionInfo?.id_balneario;
    const body = {
      id_usuario: usuario.auth_id,
      id_ubicacion,
      id_balneario,
      fecha_inicio: fechaInicio,
      fecha_salida: fechaSalida,
      metodo_pago: metodoPago,
      // Datos adicionales del formulario
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim(),
      telefono: codigoPais + telefono.trim(),
      direccion: direccion.trim(),
      ciudad: ciudad.trim(),
      codigo_postal: codigoPostal.trim(),
      pais: pais.trim(),
      precio_total: precioTotal // enviar el precio calculado
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
          {ubicacionInfo && balnearioInfo && (
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
              <p>Has seleccionado</p>
              <p className="carpa-seleccionada">Ubicación #{id_ubicacion} - Capacidad: {ubicacionInfo?.capacidad || 'N/A'}</p>
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