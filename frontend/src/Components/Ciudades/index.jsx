import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom'; 
import { supabase } from '../../supabaseClient.js';
import Logo from '../../assets/mar-del-plata.png';
import './Ciudades.css';
import Mapa from '../../assets/LocalizacionBusquedaHome.png';
import Carpa from '../../assets/Carpa.png';

function Ciudades() {
  const [ciudades, setCiudades] = useState([]);
  const [ciudadConMapa, setCiudadConMapa] = useState(null); // ciudad activa para mostrar el mapa
  const location = useLocation();
  const isPaginaCiudades = location.pathname === "/ciudades";

  useEffect(() => {
  async function fetchCiudadesConBalnearios() {
    try {
      const res = await fetch('http://localhost:3000/api/ciudades');
      const data = await res.json();

      const ciudadesAMostrar = isPaginaCiudades ? data : data.slice(0, 8);
      setCiudades(ciudadesAMostrar);
    } catch (error) {
      console.error('Error al obtener ciudades:', error);
    }
  }

  fetchCiudadesConBalnearios();
}, [isPaginaCiudades]);


  const abrirMapa = (nombreCiudad) => {
    setCiudadConMapa(nombreCiudad);
  };

  const cerrarMapa = () => {
    setCiudadConMapa(null);
  };

  return (
    <div className="ciudades-container">
      <h2 className={isPaginaCiudades ? 'titulo-ciudades' : ''}>Ciudades</h2>
      <div className="card-grid">
        {ciudades.map((ciudad) => (
          <div key={ciudad.id_ciudad} className={`ciudad-card ${isPaginaCiudades ? 'card-detalle' : ''}`}>
            <img src={Logo} alt={ciudad.nombre} className={`imgCiudad ${isPaginaCiudades ? 'imgCiudades-margin' : ''}`} />
            
            {isPaginaCiudades ? (
              <div className="detalle-card">
                <div className="info-contenido">
                  <div className="info-izquierda">
                    <h3>{ciudad.nombre}</h3>
                    <p
                      className="mapa"
                      onClick={() => abrirMapa(ciudad.nombre)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img src={Mapa} alt="mapa" className="iconoCard" />
                      Ver Mapa
                    </p>
                    <p className="estrella">
                      <img src={Carpa} alt="estrella" className="iconoCard" />
                      {ciudad.cantidadBalnearios} Balnearios
                    </p>
                  </div>
                  <Link to={`/ciudades/${ciudad.id_ciudad}/balnearios`}>
                    <button className="mirar-btn">Mirar<br />catálogo</button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card-content">
                <h3>{ciudad.nombre}</h3>
                <p>{ciudad.cantidadBalnearios} balnearios</p>
                <Link to={`/ciudades/${ciudad.id_ciudad}/balnearios`}>
                  <button>Ver balnearios</button>
                </Link>
              </div>
            )}
          </div>
        ))}

        {!isPaginaCiudades && (
          <div className="ciudad-card ver-mas-card">
            <Link to="/ciudades" className="ver-mas-circular" aria-label="Ver más ciudades">
              <span className="flecha-circular">➜</span>
            </Link>
          </div>
        )}
      </div>

      {/* Modal de Mapa */}
      {ciudadConMapa && (
        <div className="modal-mapa-overlay">
          <div className="modal-mapa-contenido">
            <button className="cerrar-mapa-btn" onClick={cerrarMapa}>✕</button>
            <h3>{ciudadConMapa}</h3>
            <iframe
              title={`Mapa de ${ciudadConMapa}`}
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: '12px' }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps?q=${encodeURIComponent(ciudadConMapa)}&output=embed`}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ciudades;
