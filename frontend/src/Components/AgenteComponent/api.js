export async function enviarMensajeAlBackend(mensaje) {
  const res = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: mensaje }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al comunicar con el backend');
  }
  const data = await res.json();
  // Maneja ambos casos: string o objeto con .data
  if (typeof data.response === "string") {
    return data.response;
  }
  if (data.response && typeof data.response.data === "string") {
    return data.response.data;
  }
  // Si no es ninguno, devuelve el objeto en string (debug)
  return JSON.stringify(data.response);
}