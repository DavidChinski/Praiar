import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import './ReservaComponent.css';

function ReservaComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id_ubicacion = searchParams.get("id");

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaSalida, setFechaSalida] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    // Obtener usuario logueado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (!user) {
      setError("Debes iniciar sesión para reservar.");
      return;
    }

    // Buscar la ubicación y su balneario
    const { data: ubicacion, error: ubicacionError } = await supabase
      .from("ubicaciones")
      .select("id_balneario")
      .eq("id_carpa", id_ubicacion)
      .single();

    if (ubicacionError || !ubicacion) {
      setError("No se encontró la ubicación.");
      return;
    }

    const id_balneario = ubicacion.id_balneario;

    // Verificar conflictos de reserva
    const { data: reservasExistentes, error: reservasError } = await supabase
      .from("reservas")
      .select("*")
      .eq("id_ubicacion", id_ubicacion)
      .eq("id_balneario", id_balneario)
      .or(`and(fecha_inicio,lte.${fechaSalida}),and(fecha_salida,gte.${fechaInicio})`);

    if (reservasError) {
      setError("Error verificando reservas.");
      return;
    }

    if (reservasExistentes.length > 0) {
      setError("Ya hay una reserva para esas fechas.");
      return;
    }

    // Insertar reserva
    const { error: insertError } = await supabase
      .from("reservas")
      .insert({
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
      setTimeout(() => navigate("/misreservas"), 2000);
    }
  };

  return (
    <div className="formulario-reserva">
      <h2>Reservar Ubicación #{id_ubicacion}</h2>
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
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
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
