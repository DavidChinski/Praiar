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

// Paleta de azules para los gráficos
const bluePalette = [
  "#003f5e",
  "#005984",
  "#0077b6",
  "#0099cc",
  "#41b6e6",
  "#73c2fb",
  "#bde0fe",
  "#8ecae6",
  "#1976d2",
  "#90caf9",
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
          setError("No sos propietario. No tienes acceso.");
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
        setError("Error al cargar estadísticas");
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
          <h1>No sos propietario. No tienes acceso.</h1>
          <button
            onClick={() => navigate(-1)}
            className="volver-button"
          >
            Volver a la página anterior
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="estadisticas-container">
        <h2 className="estadisticas-title">Estadísticas de Balnearios</h2>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="estadisticas-container">
        <h2 className="estadisticas-title">Estadísticas de Balnearios</h2>
        <div className="error-message">
          <p>{error}</p>
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
          .map((_, i) => bluePalette[i % bluePalette.length]),
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
        backgroundColor: balnearios.map((_, i) => bluePalette[i % bluePalette.length]),
      },
    ],
  };
  
  // Likes por balneario (suma de likes de reseñas)
  const likesPorBalnearioChart = {
    labels: balnearios.map((b) => b.nombre),
    datasets: [
      {
        label: "Likes (suma reseñas)",
        data: balnearios.map((b) =>
          (reseñasPorBalneario[b.id_balneario] || []).reduce(
            (acc, r) => acc + (r.likes || 0),
            0
          )
        ),
        backgroundColor: balnearios.map((_, i) => bluePalette[(i + 2) % bluePalette.length]),
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
        backgroundColor: Object.keys(estrellasCount).map((_, i) => bluePalette[i % bluePalette.length]),
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
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ],
    datasets: [
      {
        label: "Reservas por mes",
        data: reservasPorMesArr.map((r) => r.total),
        backgroundColor: reservasPorMesArr.map((_, i) => bluePalette[i % bluePalette.length]),
        borderColor: reservasPorMesArr.map((_, i) => bluePalette[i % bluePalette.length]),
        pointBackgroundColor: reservasPorMesArr.map((_, i) => bluePalette[i % bluePalette.length]),
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // --- UI ---
  return (
    <div className="estadisticas-container">
      <h2 className="estadisticas-title">Estadísticas de tus Balnearios</h2>
      
      {/* Resumen de estadísticas */}
      <div className="stats-summary">
        <div className="stat-card">
          <h3>{balnearios.length}</h3>
          <p>Balnearios</p>
        </div>
        <div className="stat-card">
          <h3>{Object.values(reservasPorBalneario).flat().length}</h3>
          <p>Reservas Totales</p>
        </div>
        <div className="stat-card">
          <h3>{Object.values(reseñasPorBalneario).flat().length}</h3>
          <p>Reseñas</p>
        </div>
        <div className="stat-card">
          <h3>{Object.values(reseñasPorBalneario).flat().reduce((acc, r) => acc + (r.likes || 0), 0)}</h3>
          <p>Likes Totales</p>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="charts-section">
        <h3 className="section-title">Análisis General</h3>
        <div className="estadisticas-charts-row">
          <div className="estadisticas-chart-block">
            <h4 className="chart-title">Balnearios por Ciudad</h4>
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
                        size: 12
                      }
                    }
                  }
                }
              }}
            />
          </div>
          <div className="estadisticas-chart-block">
            <h4 className="chart-title">Reservas por Balneario</h4>
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
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="estadisticas-charts-row">
          <div className="estadisticas-chart-block">
            <h4 className="chart-title">Reservas por Mes</h4>
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
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
          <div className="estadisticas-chart-block">
            <h4 className="chart-title">Likes por Balneario</h4>
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
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="estadisticas-charts-row">
          <div className="estadisticas-chart-block full-width">
            <h4 className="chart-title">Distribución de Estrellas</h4>
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
                      stepSize: 1
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
        <h3 className="section-title">Mis Balnearios</h3>
        <div className="table-container">
          <table className="tabla-balnearios">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ciudad</th>
                <th>Reservas</th>
                <th>Likes</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {balnearios.map((b) => (
                <tr key={b.id_balneario}>
                  <td><Link to={`/balneario/${b.id_balneario}`}>{b.nombre}</Link></td>
                  <td>
                    {ciudades.find((c) => c.id_ciudad === b.id_ciudad)?.nombre ||
                      b.ciudad ||
                      "-"}
                  </td>
                  <td>
                    {(reservasPorBalneario[b.id_balneario] || []).length}
                  </td>
                  <td>
                    {(reseñasPorBalneario[b.id_balneario] || []).reduce(
                      (acc, r) => acc + (r.likes || 0),
                      0
                    )}
                  </td>
                  <td>
                    <button
                      className="ver-button"
                      onClick={() => setSelectedBalneario(b.id_balneario)}
                    >
                      Ver más
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBalneario && (
        <BalnearioDetalle
          balneario={balnearios.find(
            (b) => b.id_balneario === selectedBalneario
          )}
          ciudades={ciudades}
          reseñas={reseñasPorBalneario[selectedBalneario] || []}
          reservas={reservasPorBalneario[selectedBalneario] || []}
          onClose={() => setSelectedBalneario(null)}
        />
      )}
    </div>
  );
}

function BalnearioDetalle({ balneario, ciudades, reseñas, reservas, onClose }) {
  // Paleta de azules para los gráficos
  const bluePalette = [
    "#003f5e",
    "#005984",
    "#0077b6",
    "#0099cc",
    "#41b6e6",
    "#73c2fb",
    "#bde0fe",
    "#8ecae6",
    "#1976d2",
    "#90caf9",
  ];

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
        backgroundColor: Object.keys(estrellasCount).map((_, i) => bluePalette[i % bluePalette.length]),
      },
    ],
  };
  
  return (
    <div className="balneario-detalle-card">
      <button className="cerrar-button" onClick={onClose}>
        ✕
      </button>
      <h3>Detalle de {balneario.nombre}</h3>
      
      <div className="detalle-stats">
        <div className="detalle-stat">
          <span className="stat-label">Ciudad:</span>
          <span className="stat-value">
            {ciudades.find((c) => c.id_ciudad === balneario.id_ciudad)?.nombre ||
              balneario.ciudad ||
              "-"}
          </span>
        </div>
        <div className="detalle-stat">
          <span className="stat-label">ID:</span>
          <span className="stat-value">{balneario.id_balneario}</span>
        </div>
        <div className="detalle-stat">
          <span className="stat-label">Dirección:</span>
          <span className="stat-value">{balneario.direccion || "-"}</span>
        </div>
        <div className="detalle-stat">
          <span className="stat-label">Teléfono:</span>
          <span className="stat-value">{balneario.telefono || "-"}</span>
        </div>
        <div className="detalle-stat">
          <span className="stat-label">Reservas:</span>
          <span className="stat-value highlight">{reservas.length}</span>
        </div>
        <div className="detalle-stat">
          <span className="stat-label">Likes (reseñas):</span>
          <span className="stat-value highlight">
            {reseñas.reduce((acc, r) => acc + (r.likes || 0), 0)}
          </span>
        </div>
        <div className="detalle-stat">
          <span className="stat-label">Reseñas:</span>
          <span className="stat-value highlight">{reseñas.length}</span>
        </div>
      </div>
      
      <div className="chart-bar">
        <h4>Distribución de Estrellas</h4>
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
                  stepSize: 1
                }
              }
            }
          }}
        />
      </div>
      
      <div className="reseñas-section">
        <h4>Últimas reseñas</h4>
        {reseñas.length === 0 && <p className="no-data">No hay reseñas aún.</p>}
        <ul className="reseñas-list">
          {reseñas.map((r) => (
            <li key={r.id_reseña} className="reseña-item">
              <div className="reseña-header">
                <b className="reseña-usuario">
                  {r.usuario_nombre || "Usuario"}
                </b>
                <span className="reseña-estrellas">
                  {r.estrellas}<span className="reseña-estrella">★</span>
                </span>
              </div>
              <p className="reseña-comentario">{r.comentario}</p>
              <span className="reseña-likes">👍 {r.likes || 0}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="reservas-section">
        <h4>Reservas recientes</h4>
        {reservas.length === 0 && <p className="no-data">No hay reservas aún.</p>}
        <ul className="reservas-list">
          {reservas.slice(-5).map((r, i) => (
            <li key={i} className="reserva-item">
              <span className="reserva-fechas">
                {r.fecha_inicio} a {r.fecha_salida}
              </span>
              <span className="reserva-carpa">
                Carpa ID: {r.id_ubicacion || r.ubicacion_id_carpa}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}