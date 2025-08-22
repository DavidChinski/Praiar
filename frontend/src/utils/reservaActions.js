const API_BASE_URL = 'http://localhost:3000';

// Función para aprobar una reserva
export const aprobarReserva = async (idReserva) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reserva/approve/${idReserva}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al aprobar la reserva');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error aprobando reserva:', error);
    return { success: false, error: error.message };
  }
};

// Función para rechazar una reserva
export const rechazarReserva = async (idReserva) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reserva/reject/${idReserva}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al rechazar la reserva');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error rechazando reserva:', error);
    return { success: false, error: error.message };
  }
};

// Función para obtener el estado de una reserva
export const obtenerEstadoReserva = async (idReserva) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reserva/status/${idReserva}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener el estado de la reserva');
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error obteniendo estado de reserva:', error);
    return { success: false, error: error.message };
  }
};

// Función para generar URLs de acción para los emails
export const generarUrlsAccion = (idReserva) => {
  const baseUrl = window.location.origin;
  return {
    aprobar: `${baseUrl}/api/reserva/approve/${idReserva}`,
    rechazar: `${baseUrl}/api/reserva/reject/${idReserva}`,
  };
};
