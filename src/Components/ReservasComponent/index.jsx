import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import FechaBusquedaHome from "../../assets/FechaBusquedaHome.png";
import BusquedaHomeSearch from '../../assets/BusquedaHome.png';
import "./ReservasComponent.css";

function ReservasComponent() {
  const [reservas, setReservas] = useState([]);
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

  const fetchReservas = async (filtrarPorFechas = false) => {
    setLoading(true);
    setError(null);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Error obteniendo usuario o no hay sesión activa.");
      setLoading(false);
      return;
    }

    let query = supabase
      .from("reservas")
      .select(`
        *,
        ubicaciones (
          id_carpa,
          posicion
        ),
        balnearios (
          nombre
        )
      `)
      .eq("id_usuario", user.id);

    if (filtrarPorFechas) {
      const { startDate, endDate } = rangoFechas[0];

      query = query
        .gte("fecha_salida", format(startDate, "yyyy-MM-dd"))
        .lte("fecha_inicio", format(endDate, "yyyy-MM-dd"));
    }

    const { data, error: reservasError } = await query;

    if (reservasError) {
      setError("Error cargando reservas.");
    } else {
      setReservas(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  const handleBuscar = () => {
    fetchReservas(true);
  };

  return (
    <div className="tus-reservas">
      <h1 className="hero-title">Tus Reservas</h1>

      {/* Filtros estilo búsqueda */}
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
                  months={1}
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

      {/* Resultados */}
      {loading && <p>Cargando reservas...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && reservas.length === 0 && <p>No tenés reservas aún.</p>}

      {!loading && reservas.length > 0 && (
        <table className="tabla-reservas">
          <thead>
            <tr>
              <th>Balneario</th>
              <th>Ubicación</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva.id_reserva}>
                <td>{reserva.balnearios?.nombre}</td>
                <td>{reserva.ubicaciones?.posicion || reserva.ubicaciones?.id_carpa}</td>
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
