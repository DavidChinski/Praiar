import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
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
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const idBalneario = Number.isNaN(parseInt(id)) ? null : parseInt(id);

  const fetchUsuarios = async (reservasData) => {
    const ids = [...new Set(reservasData.map((r) => r.id_usuario).filter(Boolean))];

    if (ids.length === 0) return;

    const { data, error } = await supabase
      .from("usuarios")
      .select("id_usuario, nombre, apellido")
      .in("id_usuario", ids);

    if (!error && data) {
      const map = {};
      data.forEach((user) => {
        map[user.id_usuario] = user;
      });
      setUsuarios(map);
    }
  };

  const fetchReservas = async (filtrarPorFechas = false) => {
    setLoading(true);
    setError(null);

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Error obteniendo usuario o no hay sesión activa.");
      setLoading(false);
      return;
    }

    let query = null;

    if (idBalneario) {
      const { data: usuario, error: usuarioError } = await supabase
        .from("usuarios")
        .select("esPropietario")
        .eq("auth_id", user.id)
        .single();

      if (usuarioError || !usuario) {
        setError("No se pudo verificar si el usuario es propietario.");
        setLoading(false);
        return;
      }

      if (usuario.esPropietario) {
        query = supabase
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
          .eq("id_balneario", idBalneario);
      } else {
        setError("No tenés permisos para ver reservas de este balneario.");
        setLoading(false);
        return;
      }
    } else {
      query = supabase
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
    }

    if (filtrarPorFechas && query) {
      const { startDate, endDate } = rangoFechas[0];
      query = query
        .lte("fecha_inicio", format(endDate, "yyyy-MM-dd"))
        .gte("fecha_salida", format(startDate, "yyyy-MM-dd"));
    }

    const { data, error: reservasError } = await query;

    if (reservasError) {
      console.error("Error al obtener reservas:", reservasError);
      setError("Error cargando reservas.");
    } else {
      setReservas(data);
      if (idBalneario) {
        await fetchUsuarios(data); // Solo cuando es propietario
      }
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
                    : reserva.balnearios?.nombre}
                </td>
                <td>
                  {reserva.ubicaciones?.posicion || reserva.ubicaciones?.id_carpa}
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
