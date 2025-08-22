import React, { useState, useEffect } from 'react';
import { aprobarReserva, rechazarReserva } from '../../utils/reservaActions';
import './ReservasPendientes.css';

const ReservasPendientes = ({ idBalneario }) => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  // Cargar reservas del balneario
  const cargarReservas = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/reservas-balneario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idBalneario,
          fechaInicio,
          fechaFin
        }),
      });

      if (!response.ok) {
        throw new Error('Error al cargar las reservas');
      }

      const data = await response.json();
      // Filtrar solo reservas pendientes (sin estado o estado = 'pendiente')
      const reservasPendientes = data.reservas.filter(reserva => 
        !reserva.estado || reserva.estado === 'pendiente'
      );
      setReservas(reservasPendientes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (idBalneario) {
      cargarReservas();
    }
  }, [idBalneario, fechaInicio, fechaFin]);

  // Manejar aprobación de reserva
  const handleAprobar = async (idReserva) => {
    try {
      const result = await aprobarReserva(idReserva);
      if (result.success) {
        // Actualizar la lista de reservas
        setReservas(prev => prev.filter(r => r.id_reserva !== idReserva));
        alert('Reserva aprobada exitosamente');
      } else {
        alert(`Error al aprobar: ${result.error}`);
      }
    } catch (err) {
      alert('Error al aprobar la reserva');
    }
  };

  // Manejar rechazo de reserva
  const handleRechazar = async (idReserva) => {
    if (!confirm('¿Estás seguro de que quieres rechazar esta reserva?')) {
      return;
    }

    try {
      const result = await rechazarReserva(idReserva);
      if (result.success) {
        // Actualizar la lista de reservas
        setReservas(prev => prev.filter(r => r.id_reserva !== idReserva));
        alert('Reserva rechazada exitosamente');
      } else {
        alert(`Error al rechazar: ${result.error}`);
      }
    } catch (err) {
      alert('Error al rechazar la reserva');
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Cargando reservas pendientes...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="reservas-pendientes">
      <div className="header">
        <h2>Reservas Pendientes de Aprobación</h2>
        <div className="filtros">
          <div className="filtro-fecha">
            <label>Desde:</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div className="filtro-fecha">
            <label>Hasta:</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <button onClick={cargarReservas} className="btn-refrescar">
            🔄 Refrescar
          </button>
        </div>
      </div>

      {reservas.length === 0 ? (
        <div className="no-reservas">
          <p>No hay reservas pendientes de aprobación</p>
        </div>
      ) : (
        <div className="reservas-lista">
          {reservas.map((reserva) => (
            <div key={reserva.id_reserva} className="reserva-item">
              <div className="reserva-header">
                <h3>Reserva #{reserva.id_reserva}</h3>
                <span className="estado-pendiente">⏳ Pendiente</span>
              </div>
              
              <div className="reserva-info">
                <div className="info-cliente">
                  <h4>Cliente</h4>
                  <p><strong>Nombre:</strong> {reserva.cliente_nombre}</p>
                  <p><strong>Email:</strong> {reserva.email}</p>
                  <p><strong>Teléfono:</strong> {reserva.telefono}</p>
                  <p><strong>Dirección:</strong> {reserva.direccion}, {reserva.ciudad}</p>
                </div>
                
                <div className="info-reserva">
                  <h4>Detalles de la Reserva</h4>
                  <p><strong>Fechas:</strong> {formatearFecha(reserva.fecha_inicio)} - {formatearFecha(reserva.fecha_salida)}</p>
                  <p><strong>Ubicaciones:</strong> {reserva.ubicaciones.map(u => u.posicion).join(', ')}</p>
                  <p><strong>Método de pago:</strong> {reserva.metodo_pago}</p>
                  <p><strong>Precio total:</strong> ${reserva.precio_total}</p>
                </div>
              </div>
              
              <div className="reserva-acciones">
                <button
                  onClick={() => handleAprobar(reserva.id_reserva)}
                  className="btn-aprobar"
                >
                  ✅ Aprobar Reserva
                </button>
                <button
                  onClick={() => handleRechazar(reserva.id_reserva)}
                  className="btn-rechazar"
                >
                  ❌ Rechazar Reserva
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservasPendientes;
