import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './BalneariosComponent.css';
import Mapa from '../../assets/LocalizacionBusquedaHome.png'
import Carpa from '../../assets/Carpa.png'

function BalneariosComponent() {
  const [balnearios, setBalnearios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || !usuario.auth_id) {
      navigate("/login");
      return;
    }

    async function fetchBalnearios() {
      try {
        const response = await fetch(`http://localhost:3000/api/mis-balnearios?auth_id=${usuario.auth_id}`);
        const result = await response.json();

        if (!response.ok) {
          setBalnearios([]);
        } else {
          setBalnearios(result.balnearios || []);
        }
      } catch (err) {
        setBalnearios([]);
      } finally {
        setLoading(false);
      }
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