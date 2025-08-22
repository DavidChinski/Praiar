import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import "./EstadisticasComponent.css";
Chart.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Title
);

// Helper para obtener usuario logueado del localStorage/sessionStorage
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

// Paleta de colores azules moderna y profesional
const modernPalette = [
  "#1e3a8a", // Azul profundo
  "#3b82f6", // Azul principal
  "#60a5fa", // Azul claro
  "#93c5fd", // Azul muy claro
  "#1e40af", // Azul oscuro
  "#2563eb", // Azul medio
  "#0ea5e9", // Azul cielo
  "#0284c7", // Azul marino
  "#0369a1", // Azul profundo
  "#075985", // Azul muy profundo
];

export default function EstadisticasComponent() {
  const [ciudades, setCiudades] = useState([]);
  const [balnearios, setBalnearios] = useState([]);
  const [reseñasPorBalneario, setReseñasPorBalneario] = useState({});
  const [reservasPorBalneario, setReservasPorBalneario] = useState({});
  const [selectedBalneario, setSelectedBalneario] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Cargar usuario de storage al montar
  useEffect(() => {
    setUsuario(getUserFromStorage());
  }, []);

  // Manejar tecla Escape para cerrar modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedBalneario) {
        setSelectedBalneario(null);
      }
    };

    if (selectedBalneario) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedBalneario]);

  // Cargar ciudades y balnearios del usuario si es dueño
  useEffect(() => {
    async function cargarDatos() {
      setLoading(true);
      setError("");
      try {
        // Traer usuario actual del storage si aún no lo puso
        const user = usuario || getUserFromStorage();
        if (!user || !user.esPropietario || !user.auth_id) {
          setLoading(false);
          setError("No tienes permisos de propietario para acceder a estas estadísticas.");
          return;
        }
        // Ciudades
        const ciudadesData = await fetch(
          "http://localhost:3000/api/ciudades"
        ).then((r) => r.json());
        setCiudades(Array.isArray(ciudadesData) ? ciudadesData : []);

        // Balnearios del dueño
        const balneariosData = await fetch(
          `http://localhost:3000/api/mis-balnearios?auth_id=${user.auth_id}`
        ).then((r) => r.json());
        const balnearios = Array.isArray(balneariosData.balnearios)
          ? balneariosData.balnearios
          : [];
        setBalnearios(balnearios);

        // Por cada balneario, traer reseñas y reservas
        const reseñasPorB = {};
        const reservasPorB = {};
        await Promise.all(
          balnearios.map(async (b) => {
            const [reseñasRes, reservasRes] = await Promise.all([
              fetch(
                `http://localhost:3000/api/balneario/${b.id_balneario}/resenias`
              )
                .then((r) => r.json())
                .catch(() => ({ resenias: [] })),
              fetch(
                `http://localhost:3000/api/balneario/${b.id_balneario}/reservas`
              )
                .then((r) => r.json())
                .catch(() => []),
            ]);
            reseñasPorB[b.id_balneario] = Array.isArray(reseñasRes.resenias)
              ? reseñasRes.resenias
              : [];
            reservasPorB[b.id_balneario] = Array.isArray(reservasRes)
              ? reservasRes
              : [];
          })
        );
        setReseñasPorBalneario(reseñasPorB);
        setReservasPorBalneario(reservasPorB);
      } catch (e) {
        setError("Error al cargar las estadísticas. Por favor, intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    }
    if (usuario && usuario.esPropietario && usuario.auth_id) {
      cargarDatos();
    }
  }, [usuario]);

  // Redirección amigable para usuarios no propietarios
  if ((!usuario || !usuario.esPropietario)) {
    return (
      <div className="estadisticas-container">
        <div className="access-denied">
          <div className="access-denied-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9ZM19 9H14V4H5V21H19V9Z" fill="currentColor"/>
            </svg>
          </div>
          <h1>Acceso Restringido</h1>
          <p>Necesitas permisos de propietario para acceder a las estadísticas de balnearios.</p>
          <button
            onClick={() => navigate(-1)}
            className="volver-button"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="estadisticas-container">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
          </div>
          <h2>Cargando Dashboard</h2>
          <p>Preparando tus estadísticas...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="estadisticas-container">
        <div className="error-container">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
            </svg>
          </div>
          <h2>Error de Carga</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // --- Estadísticas globales de todos los balnearios del dueño ---
  // Por ciudad
  const balneariosPorCiudad = {};
  balnearios.forEach((b) => {
    if (!balneariosPorCiudad[b.id_ciudad]) balneariosPorCiudad[b.id_ciudad] = 0;
    balneariosPorCiudad[b.id_ciudad]++;
  });
  const balneariosPorCiudadChart = {
    labels: ciudades
      .filter((c) => balneariosPorCiudad[c.id_ciudad])
      .map((c) => c.nombre),
    datasets: [
      {
        label: "Balnearios por ciudad",
        data: ciudades
          .filter((c) => balneariosPorCiudad[c.id_ciudad])
          .map((c) => balneariosPorCiudad[c.id_ciudad]),
        backgroundColor: ciudades
          .filter((c) => balneariosPorCiudad[c.id_ciudad])
          .map((_, i) => modernPalette[i % modernPalette.length]),
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };
  
  // Reservas por balneario
  const reservasPorBalnearioChart = {
    labels: balnearios.map((b) => b.nombre),
    datasets: [
      {
        label: "Reservas",
        data: balnearios.map(
          (b) => reservasPorBalneario[b.id_balneario]?.length || 0
        ),
        backgroundColor: balnearios.map((_, i) => modernPalette[i % modernPalette.length]),
        borderWidth: 0,
        borderRadius: 8,
      },
    ],
  };
  
  // Likes por balneario (suma de likes de reseñas)
  const likesPorBalnearioChart = {
    labels: balnearios.map((b) => b.nombre),
    datasets: [
      {
        label: "Likes totales",
        data: balnearios.map((b) =>
          (reseñasPorBalneario[b.id_balneario] || []).reduce(
            (acc, r) => acc + (r.likes || 0),
            0
          )
        ),
        backgroundColor: balnearios.map((_, i) => modernPalette[(i + 2) % modernPalette.length]),
        borderWidth: 0,
        borderRadius: 8,
      },
    ],
  };
  
  // Ranking por estrellas global
  const estrellasCount = {};
  Object.values(reseñasPorBalneario)
    .flat()
    .forEach((r) => {
      estrellasCount[r.estrellas] = (estrellasCount[r.estrellas] || 0) + 1;
    });
  const rankingEstrellas = {
    labels: Object.keys(estrellasCount).map((e) => `${e} estrellas`),
    datasets: [
      {
        label: "Cantidad",
        data: Object.values(estrellasCount),
        backgroundColor: Object.keys(estrellasCount).map((_, i) => modernPalette[i % modernPalette.length]),
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };
  
  // Reservas por mes (de todos los balnearios)
  const reservasPorMesArr = Array.from({ length: 12 }, (_, i) => {
    const mes = String(i + 1).padStart(2, "0");
    const total = Object.values(reservasPorBalneario)
      .flat()
      .filter((r) => (r.fecha_inicio || "").split("-")[1] === mes).length;
    return { mes, total };
  });
  const reservasPorMes = {
    labels: [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ],
    datasets: [
      {
        label: "Reservas por mes",
        data: reservasPorMesArr.map((r) => r.total),
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        borderWidth: 3,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Calcular estadísticas adicionales
  const totalReservas = Object.values(reservasPorBalneario).flat().length;
  const totalReseñas = Object.values(reseñasPorBalneario).flat().length;
  const totalLikes = Object.values(reseñasPorBalneario).flat().reduce((acc, r) => acc + (r.likes || 0), 0);
  const promedioEstrellas = totalReseñas > 0 
    ? (Object.values(reseñasPorBalneario).flat().reduce((acc, r) => acc + (r.estrellas || 0), 0) / totalReseñas).toFixed(1)
    : 0;

  // --- UI ---
  return (
    <div className="estadisticas-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard de Gestión</h1>
        <p className="dashboard-subtitle">Análisis completo de tus balnearios</p>
      </div>
      
      {/* Resumen de estadísticas */}
      <div className="stats-summary">
        <div className="stat-card primary">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{balnearios.length}</h3>
            <p>Balnearios Activos</p>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{totalReservas}</h3>
            <p>Reservas Totales</p>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{totalReseñas}</h3>
            <p>Reseñas Recibidas</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 9V5A3 3 0 0 0 8 5V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="2" y="9" width="20" height="12" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="15" r="1" fill="currentColor"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{totalLikes}</h3>
            <p>Likes Totales</p>
          </div>
        </div>
        <div className="stat-card secondary">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>{promedioEstrellas}</h3>
            <p>Promedio Estrellas</p>
          </div>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="charts-section">
        <div className="section-header">
          <h2 className="section-title">Análisis de Rendimiento</h2>
          <p className="section-description">Métricas clave para optimizar tu negocio</p>
        </div>
        
        <div className="estadisticas-charts-row">
          <div className="estadisticas-chart-block">
            <div className="chart-header">
              <h4 className="chart-title">Distribución por Ciudad</h4>
              <p className="chart-subtitle">Balnearios por ubicación geográfica</p>
            </div>
            <Pie 
              data={balneariosPorCiudadChart} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      font: {
                        size: 12,
                        family: 'Inter, sans-serif'
                      },
                      usePointStyle: true,
                      pointStyle: 'circle'
                    }
                  }
                }
              }}
            />
          </div>
          <div className="estadisticas-chart-block">
            <div className="chart-header">
              <h4 className="chart-title">Reservas por Balneario</h4>
              <p className="chart-subtitle">Volumen de reservas por establecimiento</p>
            </div>
            <Bar
              data={reservasPorBalnearioChart}
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { display: false } 
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      font: {
                        family: 'Inter, sans-serif'
                      }
                    },
                    grid: {
                      color: 'rgba(0,0,0,0.05)'
                    }
                  },
                  x: {
                    ticks: {
                      font: {
                        family: 'Inter, sans-serif'
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="estadisticas-charts-row">
          <div className="estadisticas-chart-block">
            <div className="chart-header">
              <h4 className="chart-title">Tendencia de Reservas</h4>
              <p className="chart-subtitle">Evolución mensual de reservas</p>
            </div>
            <Line 
              data={reservasPorMes} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      font: {
                        family: 'Inter, sans-serif'
                      }
                    },
                    grid: {
                      color: 'rgba(0,0,0,0.05)'
                    }
                  },
                  x: {
                    ticks: {
                      font: {
                        family: 'Inter, sans-serif'
                      }
                    }
                  }
                }
              }}
            />
          </div>
          <div className="estadisticas-chart-block">
            <div className="chart-header">
              <h4 className="chart-title">Engagement por Balneario</h4>
              <p className="chart-subtitle">Likes totales por establecimiento</p>
            </div>
            <Bar
              data={likesPorBalnearioChart}
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { display: false } 
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      font: {
                        family: 'Inter, sans-serif'
                      }
                    },
                    grid: {
                      color: 'rgba(0,0,0,0.05)'
                    }
                  },
                  x: {
                    ticks: {
                      font: {
                        family: 'Inter, sans-serif'
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="estadisticas-charts-row">
          <div className="estadisticas-chart-block full-width">
            <div className="chart-header">
              <h4 className="chart-title">Calificación de Clientes</h4>
              <p className="chart-subtitle">Distribución de estrellas en reseñas</p>
            </div>
            <Bar
              data={rankingEstrellas}
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { display: false } 
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      font: {
                        family: 'Inter, sans-serif'
                      }
                    },
                    grid: {
                      color: 'rgba(0,0,0,0.05)'
                    }
                  },
                  x: {
                    ticks: {
                      font: {
                        family: 'Inter, sans-serif'
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabla de balnearios */}
      <div className="table-section">
        <div className="section-header">
          <h2 className="section-title">Gestión de Balnearios</h2>
          <p className="section-description">Vista detallada de todos tus establecimientos</p>
        </div>
        <div className="table-container">
          <table className="tabla-balnearios">
            <thead>
              <tr>
                <th>Nombre del Balneario</th>
                <th>Ubicación</th>
                <th>Reservas</th>
                <th>Likes</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {balnearios.map((b) => (
                <tr key={b.id_balneario}>
                  <td>
                    <div className="balneario-info">
                      <Link to={`/balneario/${b.id_balneario}`} className="balneario-link">
                        {b.nombre}
                      </Link>
                    </div>
                  </td>
                  <td>
                    <span className="location-text">
                      {ciudades.find((c) => c.id_ciudad === b.id_ciudad)?.nombre ||
                        b.ciudad ||
                        "Sin ubicación"}
                    </span>
                  </td>
                  <td>
                    <span className="metric-value">
                      {(reservasPorBalneario[b.id_balneario] || []).length}
                    </span>
                  </td>
                  <td>
                    <span className="metric-value">
                      {(reseñasPorBalneario[b.id_balneario] || []).reduce(
                        (acc, r) => acc + (r.likes || 0),
                        0
                      )}
                    </span>
                  </td>
                  <td>
                    <button
                      className="ver-button"
                      onClick={() => setSelectedBalneario(b.id_balneario)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBalneario && (
        <div className="balneario-detalle-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedBalneario(null);
          }
        }}>
          <BalnearioDetalle
            balneario={balnearios.find(
              (b) => b.id_balneario === selectedBalneario
            )}
            ciudades={ciudades}
            reseñas={reseñasPorBalneario[selectedBalneario] || []}
            reservas={reservasPorBalneario[selectedBalneario] || []}
            onClose={() => setSelectedBalneario(null)}
          />
        </div>
      )}
    </div>
  );
}

function BalnearioDetalle({ balneario, ciudades, reseñas, reservas, onClose }) {
  // Estadísticas por balneario
  const estrellasCount = {};
  reseñas.forEach((r) => {
    estrellasCount[r.estrellas] = (estrellasCount[r.estrellas] || 0) + 1;
  });
  const rankingEstrellas = {
    labels: Object.keys(estrellasCount).map((e) => `${e} estrellas`),
    datasets: [
      {
        label: "Cantidad",
        data: Object.values(estrellasCount),
        backgroundColor: Object.keys(estrellasCount).map((_, i) => modernPalette[i % modernPalette.length]),
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  // Calcular estadísticas adicionales
  const totalLikes = reseñas.reduce((acc, r) => acc + (r.likes || 0), 0);
  const promedioEstrellas = reseñas.length > 0 
    ? (reseñas.reduce((acc, r) => acc + (r.estrellas || 0), 0) / reseñas.length).toFixed(1)
    : 0;
  
  return (
    <div className="balneario-detalle-card">
      <div className="detalle-header">
        <div className="header-content">
          <div className="header-info">
            <h3>Análisis Detallado</h3>
            <p className="balneario-nombre">{balneario.nombre}</p>
            <div className="header-stats">
              <div className="header-stat">
                <span className="stat-number">{reservas.length}</span>
                <span className="stat-label">Reservas</span>
              </div>
              <div className="header-stat">
                <span className="stat-number">{reseñas.length}</span>
                <span className="stat-label">Reseñas</span>
              </div>
              <div className="header-stat">
                <span className="stat-number">{totalLikes}</span>
                <span className="stat-label">Likes</span>
              </div>
              <div className="header-stat">
                <span className="stat-number">{promedioEstrellas}</span>
                <span className="stat-label">Promedio</span>
              </div>
            </div>
          </div>
          <button className="cerrar-button" onClick={onClose} title="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="detalle-content">
        <div className="detalle-section">
          <h4 className="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 10C20 14.4183 16.4183 18 12 18C7.58172 18 4 14.4183 4 10C4 5.58172 7.58172 2 12 2C16.4183 2 20 5.58172 20 10Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6V10L15 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Información General
          </h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Ubicación</span>
              <span className="info-value">
                {ciudades.find((c) => c.id_ciudad === balneario.id_ciudad)?.nombre ||
                  balneario.ciudad ||
                  "No especificada"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">ID del Balneario</span>
              <span className="info-value">{balneario.id_balneario}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Dirección</span>
              <span className="info-value">{balneario.direccion || "No especificada"}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Teléfono</span>
              <span className="info-value">{balneario.telefono || "No especificado"}</span>
            </div>
          </div>
        </div>

        <div className="detalle-section">
          <h4 className="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 9L12 6L16 10L21 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Distribución de Calificaciones
          </h4>
          <div className="chart-container">
            <Bar
              data={rankingEstrellas}
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { display: false } 
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      font: {
                        family: 'Inter, sans-serif'
                      }
                    },
                    grid: {
                      color: 'rgba(0,0,0,0.05)'
                    }
                  },
                  x: {
                    ticks: {
                      font: {
                        family: 'Inter, sans-serif'
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="detalle-section">
          <h4 className="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Reseñas de Clientes
          </h4>
          {reseñas.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h5>No hay reseñas disponibles</h5>
              <p>Los clientes aún no han dejado reseñas para este balneario.</p>
            </div>
          ) : (
            <div className="reseñas-container">
              {reseñas.slice(0, 3).map((r) => (
                <div key={r.id_reseña} className="reseña-card">
                  <div className="reseña-header">
                    <div className="reseña-user">
                      <img
                        className="reseña-avatar"
                        src={r.usuario_imagen || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                        alt={r.usuario_nombre || "Usuario"}
                        onError={(e) => { e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/847/847969.png"; }}
                      />
                      <div className="reseña-info">
                        <span className="reseña-name">{r.usuario_nombre || "Usuario"}</span>
                        <div className="reseña-rating">
                          {[1,2,3,4,5].map(v => (
                            <span key={v} className="star" style={{ color: v <= (r.estrellas || 0) ? "#fbbf24" : "#e5e7eb" }}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="reseña-likes">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 9V5A3 3 0 0 0 8 5V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="2" y="9" width="20" height="12" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="12" cy="15" r="1" fill="currentColor"/>
                      </svg>
                      {r.likes || 0}
                    </div>
                  </div>
                  <p className="reseña-text">{r.comentario}</p>
                </div>
              ))}
              {reseñas.length > 3 && (
                <div className="ver-mas-reseñas">
                  <button className="ver-mas-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 13L12 8L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Ver {reseñas.length - 3} reseñas más
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="detalle-section">
          <h4 className="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Reservas Recientes
          </h4>
          {reservas.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h5>No hay reservas registradas</h5>
              <p>Aún no se han realizado reservas para este balneario.</p>
            </div>
          ) : (
            <div className="reservas-container">
              {reservas.slice(-5).map((r, i) => (
                <div key={i} className="reserva-card">
                  <div className="reserva-info">
                    <div className="reserva-dates">
                      <span className="date-label">Desde</span>
                      <span className="date-value">{r.fecha_inicio}</span>
                    </div>
                    <div className="reserva-dates">
                      <span className="date-label">Hasta</span>
                      <span className="date-value">{r.fecha_salida}</span>
                    </div>
                  </div>
                  <div className="reserva-details">
                    <span className="carpa-id">Carpa ID: {r.id_ubicacion || r.ubicacion_id_carpa}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}