import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom'; 
import { supabase } from '../../supabaseClient.js';
import Logo from '../../assets/mar-del-plata.png';
import './Ciudades.css';

function Ciudades() {
  const [ciudades, setCiudades] = useState([]);
  const location = useLocation();
  const isPaginaCiudades = location.pathname === "/ciudades";

  useEffect(() => {
    async function fetchCiudadesConBalnearios() {
      const { data: ciudadesData, error: ciudadesError } = await supabase
        .from('ciudades')
        .select('id_ciudad, nombre');

      if (ciudadesError) {
        console.error('Error al obtener ciudades:', ciudadesError.message);
        return;
      }

      const ciudadesConCantidad = await Promise.all(
        ciudadesData.map(async (ciudad) => {
          const { count, error: countError } = await supabase
            .from('ciudades_x_balnearios')
            .select('*', { count: 'exact', head: true })
            .eq('id_ciudad', ciudad.id_ciudad);

          if (countError) {
            console.error('Error al contar balnearios:', countError.message);
            return { ...ciudad, cantidadBalnearios: 0 };
          }

          return { ...ciudad, cantidadBalnearios: count };
        })
      );

      // Ordenar por cantidad de balnearios descendente
      ciudadesConCantidad.sort((a, b) => b.cantidadBalnearios - a.cantidadBalnearios);

      // Mostrar solo top 8 si no está en /ciudades
      const ciudadesAMostrar = isPaginaCiudades ? ciudadesConCantidad : ciudadesConCantidad.slice(0, 8);
      setCiudades(ciudadesAMostrar);
    }

    fetchCiudadesConBalnearios();
  }, [isPaginaCiudades]);

  return (
    <div className="ciudades-container">
      <h2>Ciudades</h2>
      <div className="card-grid">
        {ciudades.map((ciudad) => (
          <div key={ciudad.id_ciudad} className="ciudad-card">
            <img src={Logo} alt={ciudad.nombre} />
            <div className="card-content">
              <h3>{ciudad.nombre}</h3>
              <p>{ciudad.cantidadBalnearios} balnearios</p>
              <button>Ver balnearios</button>
            </div>
          </div>
        ))}

        {/* Tarjeta de "Ver más ciudades" SOLO si NO está en /ciudades */}
        {!isPaginaCiudades && (
          <div className="ciudad-card ver-mas-card">
            <Link to="/ciudades" className="ver-mas-circular" aria-label="Ver más ciudades">
              <span className="flecha-circular">➜</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Ciudades;
