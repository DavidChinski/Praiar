import Header from '../Header/';
import Footer from '../Footer/';
import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient.js';
import './BalneariosFiltroCiudad.css';

function BalneariosFiltroCiudad() {
  const { id } = useParams();
  const [balnearios, setBalnearios] = useState([]);

  useEffect(() => {
    async function fetchBalnearios() {
      const { data: relaciones, error: relacionesError } = await supabase
        .from('ciudades_x_balnearios')
        .select('id_balneario')
        .eq('id_ciudad', id);

      if (relacionesError) {
        console.error("Error al buscar relaciones:", relacionesError.message);
        return;
      }

      const idsBalnearios = relaciones.map(r => r.id_balneario);
      if (idsBalnearios.length === 0) {
        setBalnearios([]);
        return;
      }

      const { data: balneariosData, error: balneariosError } = await supabase
        .from('balnearios')
        .select('id_balneario, nombre, direccion')
        .in('id_balneario', idsBalnearios);

      if (balneariosError) {
        console.error("Error al cargar balnearios:", balneariosError.message);
      } else {
        setBalnearios(balneariosData);
      }
    }

    fetchBalnearios();
  }, [id]);

  return (
    <>
      <div className="balnearios-grid">
        {balnearios.map(b => (
          <div key={b.id_balneario} className="balneario-card">
            <img src="/images/playa.jpg" alt={b.nombre} />
            <div className="card-info">
              <h3>{b.nombre}</h3>
              <p className="direccion">
                <i className="fas fa-map-marker-alt"></i> {b.direccion}
              </p>
              <button>Entrar</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default BalneariosFiltroCiudad;
