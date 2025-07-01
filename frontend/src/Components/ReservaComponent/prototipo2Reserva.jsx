import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import './ReservaComponent.css';

function ReservaComponent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const id_ubicacion = id;
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [ubicacionInfo, setUbicacionInfo] = useState(null);
  const [balnearioInfo, setBalnearioInfo] = useState(null);
  const [codigoPais, setCodigoPais] = useState('+54');

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

  return (
    <>
      <h2>Reservar Ubicación #{id_ubicacion}</h2>
      <div className="formulario-reserva">

        {error && <div className="error">{error}</div>}
        {exito && <div className="exito">{exito}</div>}
        <div className="informacion-reserva">
            {ubicacionInfo && balnearioInfo && (
            <div className="info-balneario">
              <h4>{balnearioInfo.nombre}</h4>
              <p>{balnearioInfo.direccion}, {balnearioInfo.ciudad_nombre}</p>
              <p><strong>Ubicación capacidad:</strong> {ubicacionInfo.capacidad}</p>
            </div>
          )}

          <div className="info-datos-reserva">
            <h4>Los datos de tus reserva</h4>
            <div className="datos-entrada-salida">
              <div className="datos-entrada">
                <h5>Entrada</h5>
                <p className="fecha"></p>
              </div>
              <div className="datos-salida">
                <h5>Salida</h5>
                <p className="fecha"></p>
              </div>
            </div>
            <div className="duracion-estancia">
              <p>Duración total de la estancia:</p>
              <p className="dias"></p>
            </div>
            <div className="seleccion-carpa">
              <p>Has seleccionado</p>
              <p className="carpa-seleccionada"></p>
            </div>
          </div>
        </div>
        

        <form className="reserva-form">
          <h2>Introduce tus datos</h2>
          <div className="form-group">
            <label>Nombre/s<span className="required-asterisk">*</span>
              <input type="text" name="nombre" required />
            </label>

            <label>Apellido/s<span className="required-asterisk">*</span>
              <input type="text" name="apellido" required />
            </label>
          </div>

          <label>Email<span className="required-asterisk">*</span>
            <input type="email" name="email" required />
          </label>

          <div className="form-group telefono-group">
            <label>Teléfono<span className="required-asterisk">*</span>
              <div className="telefono-wrapper">
                <select value={codigoPais} onChange={(e) => setCodigoPais(e.target.value)}>
                  <option value="+54">🇦🇷 +54</option>
                </select>
                <input
                  type="number"
                  name="telefono"
                  required
                />
              </div>
            </label>
          </div>

          <label>Dirección<span className="required-asterisk">*</span>
            <input type="text" name="direccion" required />
          </label>

          <label>Ciudad<span className="required-asterisk">*</span>
            <input type="text" name="ciudad" required />
          </label>

          <label>Codigo Postal
            <input type="text" name="codigo_postal" />
          </label>

          <label>Pais/region<span className="required-asterisk">*</span>
            <select name="pais" required>
              <option value="">Seleccione un país</option>
            </select>
          </label>
        </form>
      </div>
    </>
  );
}

export default ReservaComponent;
