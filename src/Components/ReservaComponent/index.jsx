import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import './ReservaComponent.css';

function ReservaComponent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const id_ubicacion = id;

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaSalida, setFechaSalida] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [ubicacionInfo, setUbicacionInfo] = useState(null);
  const [balnearioInfo, setBalnearioInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: ubicacion, error: ubicacionError } = await supabase
        .from("ubicaciones")
        .select("*, balnearios: id_balneario (nombre, direccion, ciudad: id_ciudad (nombre))")
        .eq("id_carpa", id_ubicacion)
        .single();

      if (ubicacionError || !ubicacion) {
        setError("Error al obtener datos de la ubicación.");
        return;
      }

      setUbicacionInfo(ubicacion);
      setBalnearioInfo(ubicacion.balnearios);
    };

    fetchData();
  }, [id_ubicacion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    // Validación de fechas
    if (!fechaInicio || !fechaSalida) {
      setError("Debes seleccionar una fecha de inicio y una de salida.");
      return;
    }

    if (fechaInicio > fechaSalida) {
      setError("La fecha de inicio no puede ser posterior a la de salida.");
      return;
    }

    // Autenticación del usuario
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user) {
      setError("Debes iniciar sesión para reservar.");
      return;
    }

    const id_balneario = ubicacionInfo?.id_balneario;

    // Verificar reservas existentes que se solapen
    const { data: reservasExistentes, error: reservasError } = await supabase
      .from("reservas")
      .select("*")
      .eq("id_ubicacion", id_ubicacion)
      .eq("id_balneario", id_balneario)
      .lte("fecha_inicio", fechaSalida)
      .gte("fecha_salida", fechaInicio);


    if (reservasError) {
      setError("Error verificando reservas.");
      return;
    }

    if (reservasExistentes.length > 0) {
      setError("Ya hay una reserva para esas fechas.");
      return;
    }

    // Insertar nueva reserva
    const { error: insertError } = await supabase.from("reservas").insert({
      id_usuario: user.id,
      id_ubicacion: id_ubicacion,
      id_balneario: id_balneario,
      fecha_inicio: fechaInicio,
      fecha_salida: fechaSalida,
      metodo_pago: metodoPago
    });

    if (insertError) {
      setError("Error al realizar la reserva.");
    } else {
      setExito("Reserva realizada con éxito.");
      setTimeout(() => navigate("/tusreservas"), 2000);
    }
  };

  return (
    <div className="formulario-reserva">
      <h2>Reservar Ubicación #{id_ubicacion}</h2>

      {ubicacionInfo && balnearioInfo && (
        <div className="info-extra">
          <p><strong>Ubicación capacidad:</strong> {ubicacionInfo.capacidad}</p>
          <p><strong>Balneario:</strong> {balnearioInfo.nombre}</p>
          <p><strong>Dirección:</strong> {balnearioInfo.direccion}</p>
          <p><strong>Ciudad:</strong> {balnearioInfo.ciudad?.nombre}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label>
          Fecha inicio:
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
          />
        </label>
        <label>
          Fecha salida:
          <input
            type="date"
            value={fechaSalida}
            onChange={(e) => setFechaSalida(e.target.value)}
            required
          />
        </label>
        <label>
          Método de pago:
          <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
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
  );
}

export default ReservaComponent;
