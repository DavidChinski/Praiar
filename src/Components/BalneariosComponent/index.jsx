import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient.js";
import { Link, useNavigate } from "react-router-dom";
import './BalneariosComponent.css';
import Mapa from '../../assets/LocalizacionBusquedaHome.png'
import Carpa from '../../assets/Carpa.png'

function BalneariosComponent() {
  const [balnearios, setBalnearios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBalnearios() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Usuario no autenticado:", authError?.message);
        navigate("/login");
        return;
      }

      // Obtené los balnearios directamente usando el user.id (uuid del auth)
      const { data: balneariosData, error: balneariosError } = await supabase
        .from("balnearios")
        .select("*")
        .eq("id_usuario", user.id); // 🔑 Usa el uuid directamente

      if (balneariosError) {
        console.error("Error cargando balnearios:", balneariosError.message);
        setBalnearios([]);
      } else {
        setBalnearios(balneariosData);
      }

      setLoading(false);
    }

    fetchBalnearios();
  }, [navigate]);

  if (loading) {
    return <p>Cargando balnearios...</p>;
  }

  return (
    <div className="balnearios-container">
      <h1>Tus Balnearios</h1>

      {balnearios.length === 0 ? (
        <p>No tienes balnearios registrados.</p>
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
                  <Link to={`/balneario/${balneario.id_balneario}`}>
                    <button className="mirar-btn">Entrar</button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}

export default BalneariosComponent;
