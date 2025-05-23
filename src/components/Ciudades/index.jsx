import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient.js';
import Logo from '../../img/mar-del-plata.png';
import './Ciudades.css';
import { useNavigate } from 'react-router-dom';

function Ciudades() {
  const [ciudades, setCiudades] = useState([]);
  const navigate = useNavigate();

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
      const top10Ciudades = ciudadesConCantidad.slice(0, 10);
      setCiudades(top10Ciudades);
    }

    fetchCiudadesConBalnearios();
  }, []);


  return (
    <div className="ciudades-container">
      <h2>Ciudades</h2>
      <div className="card-grid">
        {ciudades.map((ciudad) => (
          <div key={ciudad.id_ciudad} className="ciudad-card">
            <img src={Logo} alt={ciudad.nombre} />
            <div className="card-content">
              <h3>{ciudad.nombre}</h3>
              <p>{ciudad.cantidadBalnearios} balneario(s)</p>
              <button onClick={() => navigate(`/balnearios/${ciudad.id_ciudad}`)}>Ver balnearios</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Ciudades;
