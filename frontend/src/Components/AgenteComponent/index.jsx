import React, { useState } from 'react';
import Chat from './chat';
import { enviarMensajeAlBackend } from './api';
import './AgenteComponent.css';

export default function App() {
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMensajes([...mensajes, { rol: 'user', texto: input }]);
    setLoading(true);
    setError('');
    setInput('');
    try {
      const respuesta = await enviarMensajeAlBackend(input);
      const respuestaJson = typeof respuesta === 'string' ? JSON.parse(respuesta) : respuesta;

      let textoPlano;
      if (respuestaJson?.data?.result) {
        const match = respuestaJson.data.result.match(/<\/think>([\s\S]*)$/i);
        textoPlano = match ? match[1].trim() : respuestaJson.data.result.trim();
      } else if (typeof respuesta === 'string') {
        textoPlano = respuesta;
      } else {
        textoPlano = JSON.stringify(respuesta);
      }

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
        <form className="mt-4 flex gap-2" onSubmit={handleSend}>
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
        </form>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>
    </div>
  );
}