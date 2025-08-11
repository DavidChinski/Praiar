import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function PagoExitoso() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mensaje, setMensaje] = useState('Procesando pago...');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function confirmarReserva() {
      try {
        const status = searchParams.get('status') || searchParams.get('collection_status');
        if (status && status !== 'approved') {
          setError('El pago no fue aprobado.');
          return;
        }

        const reservaStr = localStorage.getItem('reservaPendiente');
        if (!reservaStr) {
          setMensaje('Pago aprobado. No se encontró una reserva pendiente para confirmar.');
          return;
        }

        const body = JSON.parse(reservaStr);
        const resp = await fetch('http://localhost:3000/api/reserva', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await resp.json();
        if (!resp.ok) {
          setError(data?.error || 'Error al confirmar la reserva luego del pago.');
          return;
        }
        localStorage.removeItem('reservaPendiente');
        setMensaje('Pago aprobado y reserva confirmada. Redirigiendo...');
        setTimeout(() => navigate('/tusreservas/null'), 2000);
      } catch (e) {
        setError('Error inesperado al confirmar la reserva.');
      }
    }
    confirmarReserva();
  }, [navigate, searchParams]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Pago exitoso</h2>
      {error ? <p style={{ color: 'red' }}>{error}</p> : <p>{mensaje}</p>}
    </div>
  );
}

export default PagoExitoso;


