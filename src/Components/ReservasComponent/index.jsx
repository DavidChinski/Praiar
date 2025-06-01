import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

function ReservasComponent() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReservas = async () => {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Error obteniendo usuario o no hay sesión activa.");
        setLoading(false);
        return;
      }

      const { data, error: reservasError } = await supabase
        .from("reservas")
        .select("*, ubicaciones (nombre), balnearios (nombre)")
        .eq("id_usuario", user.id);

      if (reservasError) {
        setError("Error cargando reservas.");
      } else {
        setReservas(data);
      }

      setLoading(false);
    };

    fetchReservas();
  }, []);

  return (
    <div className="tus-reservas">
      <h1>Tus reservas</h1>

      {loading && <p>Cargando reservas...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && reservas.length === 0 && <p>No tenés reservas aún.</p>}

      <ul>
        {reservas.map((reserva) => (
          <li key={reserva.id}>
            <p><strong>Balneario:</strong> {reserva.balnearios?.nombre}</p>
            <p><strong>Ubicación:</strong> {reserva.ubicaciones?.nombre}</p>
            <p><strong>Desde:</strong> {reserva.fecha_inicio}</p>
            <p><strong>Hasta:</strong> {reserva.fecha_salida}</p>
            <p><strong>Método de pago:</strong> {reserva.metodo_pago}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReservasComponent;
