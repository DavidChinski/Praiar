import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient.js";
import { Link, useNavigate } from "react-router-dom";
import './BalneariosComponent.css';

function BalneariosComponent() {
  const [balnearios, setBalnearios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchBalnearios() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Usuario no autenticado:", authError?.message);
        navigate("/login"); // Redirige si no está logueado
        return;
      }

      // Buscar el usuario en la tabla `usuarios` usando su auth.uid
      const { data: usuario, error: userError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("auth_id", user.id)
        .single();

      if (userError || !usuario) {
        console.error("No se encontró el usuario en la tabla 'usuarios':", userError?.message);
        setBalnearios([]);
        setLoading(false);
        return;
      }

      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Buscar balnearios del usuario
      const { data: balneariosData, error: balneariosError } = await supabase
        .from("balnearios")
        .select("*")
        .eq("id_usuario", usuario.id_usuario);

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
      )}
    </div>
  );
}

export default BalneariosComponent;
