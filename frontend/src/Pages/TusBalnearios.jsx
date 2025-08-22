import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import BalneariosComponent from '../components/BalneariosComponent/';
import CrearBalneario from '../Components/CrearBalneario';
import ReservasPendientes from '../Components/ReservasPendientes';
import './TusBalnearios.css';
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

  const [activeTab, setActiveTab] = useState('balnearios'); // Agregar estado para pestañas

  return (
    <div className="tus-balnearios">
      <h1>Tus Balnearios</h1>
      
      {/* Pestañas de navegación */}
      <div className="tabs-navigation">
        <button 
          className={`tab-button ${activeTab === 'balnearios' ? 'active' : ''}`}
          onClick={() => setActiveTab('balnearios')}
        >
          🏖️ Mis Balnearios
        </button>
        <button 
          className={`tab-button ${activeTab === 'reservas' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservas')}
        >
          📋 Reservas Pendientes
        </button>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === 'balnearios' && (
        <div className="tab-content">
          {/* Contenido existente de balnearios */}
          <BalneariosComponent />
          <CrearBalneario />
        </div>
      )}

      {activeTab === 'reservas' && (
        <div className="tab-content">
          {/* Assuming 'balnearios' state holds the list of balnearios */}
          {/* This part needs to be updated to fetch or pass the actual balnearios data */}
          {/* For now, we'll just show a placeholder or a message */}
          <p>Aquí se mostrarán las reservas pendientes de tus balnearios.</p>
          {/* Example: If you had a state for balnearios, you'd loop through it here */}
          {/* {balnearios.map(balneario => ( */}
          {/*   <div key={balneario.id_balneario} className="balneario-reservas-section"> */}
          {/*     <h2>Reservas de {balneario.nombre}</h2> */}
          {/*     <ReservasPendientes idBalneario={balneario.id_balneario} /> */}
          {/*   </div> */}
          {/* ))} */}
        </div>
      )}
    </div>
  );
}

export default TusBalnearios;
