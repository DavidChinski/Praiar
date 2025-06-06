import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient.js";
import { useParams } from "react-router-dom";
import './BalneariosPorCiudad.css';
import Mapa from '../../assets/LocalizacionBusquedaHome.png';
import Carpa from '../../assets/Carpa.png';
import Layout from '../../Layout/';

function BalneariosPorCiudad() {
  const { idCiudad } = useParams(); // ID de la ciudad desde la URL
  const [balnearios, setBalnearios] = useState([]);
  const [nombreCiudad, setNombreCiudad] = useState(""); // Estado para el nombre de la ciudad
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Obtener nombre de la ciudad
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

      // Obtener balnearios de esa ciudad
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

  if (loading) {
    return <p>Cargando balnearios...</p>;
  }

  return (
    <Layout>
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
                      <p>
                        <img src={Mapa} alt="mapa" className="iconoCard" />
                        {balneario.direccion}
                      </p>
                      <p>
                        <img src={Carpa} alt="carpa" className="iconoCard" />
                        Cantidad de carpas
                      </p>
                    </div>
                    <button
                      className="mirar-btn"
                      onClick={() => window.location.href = `/balneario/${balneario.id_balneario}`}
                    >
                      Entrar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default BalneariosPorCiudad;
