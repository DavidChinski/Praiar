import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom'; 
import { supabase } from '../../supabaseClient.js';
import Logo from '../../assets/mar-del-plata.png';
import './Ciudades.css';
import Mapa from '../../assets/LocalizacionBusquedaHome.png'
import Carpa from '../../assets/Carpa.png'

function Ciudades() {
  const [ciudades, setCiudades] = useState([]);
  const [ciudadConMapa, setCiudadConMapa] = useState(null); // ciudad activa para mostrar el mapa
  const location = useLocation();
  const isPaginaCiudades = location.pathname === "/ciudades";

  useEffect(() => {
    async function fetchCiudadesConBalnearios() {
      const { data: ciudadesData, error: ciudadesError } = await supabase
        .from('ciudades')
        .select('id_ciudad, nombre')
        .order('nombre', { ascending: true });

      if (ciudadesError) {
        console.error('Error al obtener ciudades:', ciudadesError.message);
        return;
      }

      const ciudadesConCantidad = await Promise.all(
        (ciudadesData || []).map(async (ciudad) => {
          const { count, error: countError } = await supabase
            .from('balnearios')
            .select('*', { count: 'exact', head: true })
            .eq('id_ciudad', ciudad.id_ciudad);

          if (countError) {
            console.error('Error al contar balnearios:', countError.message);
            return { ...ciudad, cantidadBalnearios: 0 };
          }

          return { ...ciudad, cantidadBalnearios: typeof count === 'number' ? count : 0 };
        })
      );

      ciudadesConCantidad.sort((a, b) => b.cantidadBalnearios - a.cantidadBalnearios);
      const ciudadesAMostrar = isPaginaCiudades ? ciudadesConCantidad : ciudadesConCantidad.slice(0, 8);
      setCiudades(ciudadesAMostrar);
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
      <h2>Ciudades</h2>
      <div className="card-grid">
        {ciudades.map((ciudad) => (
          <div key={ciudad.id_ciudad} className={`ciudad-card ${isPaginaCiudades ? 'card-detalle' : ''}`}>
            <img src={Logo} alt={ciudad.nombre} className={`imgCiudad ${isPaginaCiudades ? 'imgCiudades-margin' : ''}`}  />
            
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
                  <button className="mirar-btn" onClick={<Link to="/ciudades">Ciudades</Link>}>Mirar<br />catálogo</button>
                </div>
              </div>
            ) : (
              <div className="card-content">
                <h3>{ciudad.nombre}</h3>
                <p>{ciudad.cantidadBalnearios} balnearios</p>
                <button>Ver balnearios</button>
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
