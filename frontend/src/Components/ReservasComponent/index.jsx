import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import FechaBusquedaHome from "../../assets/FechaBusquedaHome.png";
import BusquedaHomeSearch from "../../assets/BusquedaHome.png";
import "./ReservasComponent.css";

function ReservasComponent() {
  const [reservas, setReservas] = useState([]);
  const [usuarios, setUsuarios] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rangoFechas, setRangoFechas] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [showCalendario, setShowCalendario] = useState(false);
  const { id } = useParams();
  const idBalneario = Number.isNaN(parseInt(id)) ? null : parseInt(id);

  // Obtener usuario logueado del localStorage
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  // Traer reservas desde el backend
  const fetchReservas = async (filtrarPorFechas = false) => {
    setLoading(true);
    setError(null);

    if (!usuario) {
      setError("No hay usuario logueado.");
      setLoading(false);
      return;
    }

    let url = "";
    let body = null;
    let method = "POST";

    if (idBalneario && usuario.esPropietario) {
      // Reservas de propietarios (todas las reservas del balneario)
      url = "http://localhost:3000/api/reservas-balneario";
      body = {
        idBalneario,
      };
    } else {
      // Reservas del usuario
      url = "http://localhost:3000/api/reservas-usuario";
      body = {
        auth_id: usuario.auth_id,
      };
    }

    if (filtrarPorFechas) {
      const { startDate, endDate } = rangoFechas[0];
      body.fechaInicio = format(startDate, "yyyy-MM-dd");
      body.fechaFin = format(endDate, "yyyy-MM-dd");
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Error cargando reservas.");
        setReservas([]);
      } else {
        setReservas(result.reservas || []);
        if (idBalneario && result.usuarios) {
          setUsuarios(result.usuarios);
        }
      }
    } catch (e) {
      setError("Error cargando reservas.");
      setReservas([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReservas();
    // eslint-disable-next-line
  }, []);

  const handleBuscar = () => {
    fetchReservas(true);
  };

  return (
    <div className="tus-reservas">
      <h1 className="hero-title">{idBalneario ? "Reservas de Clientes" : "Tus Reservas"}</h1>

      <div className="busqueda-form">
        <div className="input-group date-group">
          <img
            src={FechaBusquedaHome}
            className="iconFecha"
            alt="Icono de fecha"
            onClick={() => setShowCalendario(!showCalendario)}
            style={{ cursor: "pointer" }}
          />
          <div className="input-wrapper">
            <label className="subtitulo">Fecha</label>
            <div
              className="date-summary input-estandar"
              onClick={() => setShowCalendario(!showCalendario)}
            >
              {format(rangoFechas[0].startDate, "dd/MM/yyyy")} -{" "}
              {format(rangoFechas[0].endDate, "dd/MM/yyyy")}
            </div>
            {showCalendario && (
              <div className="calendario-container">
                <DateRange
                  editableDateInputs={true}
                  onChange={(item) => setRangoFechas([item.selection])}
                  moveRangeOnFirstSelection={false}
                  ranges={rangoFechas}
                  months={2}
                  direction="horizontal"
                  rangeColors={["#005984"]}
                  minDate={new Date()}
                />
              </div>
            )}
          </div>
        </div>

        <button className="search-button" onClick={handleBuscar}>
          <img src={BusquedaHomeSearch} className="search-icon" alt="Buscar" />
        </button>
      </div>

      {loading && <p>Cargando reservas...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && reservas.length === 0 && <p>No tenés reservas aún.</p>}

      {!loading && reservas.length > 0 && (
        <table className="tabla-reservas">
          <thead>
            <tr>
              <th>{idBalneario ? "Cliente" : "Balneario"}</th>
              <th>Ubicación</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva.id_reserva}>
                <td>
                  {idBalneario && usuarios[reserva.id_usuario]
                    ? `${usuarios[reserva.id_usuario].nombre} ${usuarios[reserva.id_usuario].apellido}`
                    : reserva.balneario_nombre}
                </td>
                <td>
                  {reserva.ubicacion_posicion || reserva.ubicacion_id_carpa}
                </td>
                <td>{format(new Date(reserva.fecha_inicio), "dd/MM/yyyy")}</td>
                <td>{format(new Date(reserva.fecha_salida), "dd/MM/yyyy")}</td>
                <td>
                  <button className="ver-button">Ver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ReservasComponent;