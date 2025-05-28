import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient.js";
import { Link } from "react-router-dom";
import './BalneariosComponent.css'

function BalneariosComponent() {
  const [balnearios, setBalnearios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBalnearios() {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      if (!usuario) {
        setBalnearios([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("balnearios")
        .select("*")
        .eq("id_usuario", usuario.id_usuario);

      if (error) {
        console.error("Error cargando balnearios:", error.message);
        setBalnearios([]);
      } else {
        setBalnearios(data);
      }

      setLoading(false);
    }

    fetchBalnearios();
  }, []);

  if (loading) {
    return <p>Cargando balnearios...</p>;
  }

  return (
    <div className="balnearios-container">
      <h1>Tus Balnearios</h1>

      {balnearios.length === 0 ? (
        <>
          <p>No tienes balnearios registrados.</p>
          <Link to="/agregar-balneario">
            <button>Agregar nuevo balneario</button>
          </Link>
        </>
      ) : (
        <>
          <div className="card-grid-balnearios">
            {balnearios.map((balneario) => (
              <div key={balneario.id_balneario} className="balneario-card">
                <img
                  src={balneario.imagen || "https://via.placeholder.com/240x150"}
                  alt={balneario.nombre}
                />
                <div className="card-content-balnearios">
                  <h3>{balneario.nombre}</h3>
                  <p>{balneario.direccion}</p>
                  <Link to={`/balneario/${balneario.id_balneario}`}>
                    <button className="mirar-btn">Ver balneario</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          
        </>
      )}
    </div>
  );
}

export default BalneariosComponent;
