import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
    // Cargar info de la ubicación y balneario desde el backend
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setExito(null);

    if (!fechaInicio || !fechaSalida) {
      setError("Debes seleccionar una fecha de inicio y una de salida.");
      return;
    }
    if (fechaInicio > fechaSalida) {
      setError("La fecha de inicio no puede ser posterior a la de salida.");
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
      metodo_pago: metodoPago
    };

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
  };

  return (
    <div className="formulario-reserva">
      <h2>Reservar Ubicación #{id_ubicacion}</h2>

      {ubicacionInfo && balnearioInfo && (
        <div className="info-extra">
          <p><strong>Ubicación capacidad:</strong> {ubicacionInfo.capacidad}</p>
          <p><strong>Balneario:</strong> {balnearioInfo.nombre}</p>
          <p><strong>Dirección:</strong> {balnearioInfo.direccion}</p>
          <p><strong>Ciudad:</strong> {balnearioInfo.ciudad_nombre}</p>
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