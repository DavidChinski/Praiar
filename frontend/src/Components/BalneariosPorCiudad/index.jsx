import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient.js";
import { useParams, useNavigate } from "react-router-dom";
import './BalneariosPorCiudad.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function BalneariosPorCiudad() {
  const { idCiudad } = useParams();
  const navigate = useNavigate();
  const [balnearios, setBalnearios] = useState([]);
  const [nombreCiudad, setNombreCiudad] = useState("");
  const [loading, setLoading] = useState(true);
  const [mapaDireccion, setMapaDireccion] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const { data: ciudadData, error: ciudadError } = await supabase
        .from("ciudades")
        .select("nombre")
        .eq("id_ciudad", idCiudad)
        .single();

      if (ciudadError) {
        console.error("Error obteniendo ciudad:", ciudadError.message);
        setNombreCiudad("Ciudad desconocida");
      } else {
        setNombreCiudad(ciudadData.nombre);
      }

      const { data: balneariosData, error: balneariosError } = await supabase
        .from("balnearios")
        .select("*")
        .eq("id_ciudad", idCiudad);

      if (balneariosError) {
        console.error("Error cargando balnearios:", balneariosError.message);
        setBalnearios([]);
      } else {
        setBalnearios(balneariosData);
      }

      setLoading(false);
    }

    fetchData();
  }, [idCiudad]);

  const abrirMapa = (direccionBalneario) => {
    const direccionCompleta = `${direccionBalneario}, ${nombreCiudad}`;
    setMapaDireccion(direccionCompleta);
  };

  const cerrarMapa = () => {
    setMapaDireccion(null);
  };

  // AHORA solo enviamos el id en el state!
  const handleEntrar = (balneario) => {
    navigate(`/balneario/${balneario.id_balneario}`, { state: { id: balneario.id_balneario } });
  };

  if (loading) {
    return <p>Cargando balnearios...</p>;
  }

  return (
    <>
      <div className="balnearios-container">
        <h1>Balnearios en {nombreCiudad}</h1>

        {balnearios.length === 0 ? (
          <p>No hay balnearios registrados en {nombreCiudad}.</p>
        ) : (
          <div className="card-grid-balnearios">
            {balnearios.map((balneario) => (
              <div key={balneario.id_balneario} className="balneario-card card-detalle">
                <img
                  src={balneario.imagen || "https://via.placeholder.com/240x150"}
                  alt={balneario.nombre}
                  className="imgCiudad imgCiudades-margin"
                />
                <div className="detalle-card">
                  <div className="info-contenido">
                    <div className="info-izquierda">
                      <h3>{balneario.nombre}</h3>
                      <p className="mapa" style={{ cursor: 'pointer' }} onClick={() => abrirMapa(balneario.direccion)}>
                        <FontAwesomeIcon icon="fa-solid fa-location-dot" alt="mapa" className="iconoCard" />
                        {balneario.direccion}
                      </p>
                      <p>
                        <FontAwesomeIcon icon="fa-solid fa-tent" className="iconoCard"/>
                        Cantidad de carpas
                      </p>
                    </div>
                    <button
                      className="mirar-btn"
                      onClick={() => handleEntrar(balneario)}
                    >
                      Entrar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Mapa */}
        {mapaDireccion && (
          <div className="modal-mapa-overlay">
            <div className="modal-mapa-contenido">
              <button className="cerrar-mapa-btn" onClick={cerrarMapa}>✕</button>
              <h3>{mapaDireccion}</h3>
              <iframe
                title={`Mapa de ${mapaDireccion}`}
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: '12px' }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapaDireccion)}&output=embed`}
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default BalneariosPorCiudad;