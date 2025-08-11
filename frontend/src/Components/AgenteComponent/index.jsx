import React, { useState } from 'react';
import Chat from './chat';
import { enviarMensajeAlBackend } from './api';
import './AgenteComponent.css';

export default function App() {
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    // Construye un mensaje con metadatos de filtros si el usuario seleccionó fechas
    const filtros = [];
    if (fechaInicio) filtros.push(`fechaInicio=${fechaInicio}`);
    if (fechaFin) filtros.push(`fechaFin=${fechaFin}`);
    const meta = filtros.length > 0 ? `\n[Filtros]\n- ${filtros.join('\n- ')}\n` : '';
    const mensajeParaEnviar = `${meta}${input}`;

    setMensajes([...mensajes, { rol: 'user', texto: mensajeParaEnviar }]);
    setLoading(true);
    setError('');
    setInput('');
    try {
      const respuesta = await enviarMensajeAlBackend(mensajeParaEnviar);
      const textoPlano = typeof respuesta === 'string' ? respuesta : JSON.stringify(respuesta);
      setMensajes(ms => [...ms, { rol: 'asistente', texto: textoPlano }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-chat-bg min-h-screen">
      <div className="chat-box w-full max-w-md">
        <h1>
        Chat con el Asistente de Praiar
        </h1>
        <Chat mensajes={mensajes} loading={loading} />
        <form className="mt-4 grid gap-2" onSubmit={handleSend}>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm">Fecha inicio (opcional)</label>
              <input
                type="date"
                className="w-full border p-2 rounded"
                value={fechaInicio}
                onChange={e => setFechaInicio(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm">Fecha salida (opcional)</label>
              <input
                type="date"
                className="w-full border p-2 rounded"
                value={fechaFin}
                onChange={e => setFechaFin(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border p-2 rounded"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Escribí tu pregunta..."
              disabled={loading}
            />
            <button className="bg-blue-500 text-white px-4 rounded" disabled={loading}>
              Enviar
            </button>
          </div>
        </form>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </div>
  );
}