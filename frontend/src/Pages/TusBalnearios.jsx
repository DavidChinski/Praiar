import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import BalneariosComponent from '../components/BalneariosComponent/';
import CrearBalneario from '../Components/CrearBalneario';
function getUserFromStorage() {
  try {
    const str =
      window.localStorage.getItem("usuario") ||
      window.sessionStorage.getItem("usuario");
    if (str) return JSON.parse(str);
    return null;
  } catch {
    return null;
  }
}
function TusBalnearios() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setUsuario(getUserFromStorage());
  }, []);

  useEffect(() => {
    async function cargarDatos() {
      setLoading(true);
      setError("");
      try {
        const user = usuario || getUserFromStorage();
        if (!user || !user.esPropietario || !user.auth_id) {
          setError("No sos propietario. No tienes acceso.");
        }
      } catch (e) {
        setError("Error al cargar balnearios");
      } finally {
        setLoading(false);
      }
    }

    cargarDatos();
  }, [usuario]);

  if (loading) return <p>Cargando...</p>;
  if (error) return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: "1rem",
    }}>
      <h1 style={{ marginBottom: "1rem" }}>{error}</h1>
      <button
        onClick={() => navigate(-1)}
        style={{
          border: "2px solid #a1c3d6",
          backgroundColor: "#ddf2f8",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
          fontSize: "1.1rem"
        }}
      >
        Volver a la página anterior
      </button>
    </div>
  );

  return (
    <div id="seccion-inferior">
      <BalneariosComponent />
      <CrearBalneario />
    </div>
  );
}

export default TusBalnearios;
