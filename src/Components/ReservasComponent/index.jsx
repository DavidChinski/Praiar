import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import "./ReservasComponent.css";

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

      console.log("User ID:", user.id); // para debug

      const { data, error: reservasError } = await supabase
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

      if (reservasError) {
        console.error("Reservas error:", reservasError);
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
          <li key={reserva.id_reserva}>
            <p><strong>Balneario:</strong> {reserva.balnearios?.nombre}</p>
            <p><strong>Ubicación:</strong> Carpa #{reserva.ubicaciones?.posicion || reserva.ubicaciones?.id_carpa}</p>
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
