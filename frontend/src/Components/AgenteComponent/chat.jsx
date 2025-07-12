import React from 'react';

function formatearMensajeComoLista(texto) {
  // Detecta listas separadas por guiones: "- item1 - item2..."
  const partes = texto.split(/-\s+/).map(s => s.trim()).filter(Boolean);
  // Si hay al menos 3 partes y la primera no es todo el texto, asumimos que es lista
  if (partes.length > 2 && partes.join(' - ') !== texto.replace(/\n/g, '')) {
    return (
      <ul>
        {partes.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    );
  }
  // Si no es lista, muestra como texto normal (con saltos de línea)
  return texto.split('\n').map((line, i) => <span key={i}>{line}<br /></span>);
}

export default function Chat({ mensajes = [], loading }) {
  return (
    <div className="chat-mensajes">
      {mensajes.map((msg, idx) => {
        const rol = msg.rol === 'user' ? 'usuario' : 'asistente';
        let contenido = formatearMensajeComoLista(msg.texto);

        return (
          <div key={idx} className={`mensaje ${rol}`}>
            <div className="burbuja">{contenido}</div>
          </div>
        );
      })}
      {loading && (
        <div className="mensaje asistente">
          <div className="burbuja">
            <span className="loader"></span>
          </div>
        </div>
      )}
    </div>
  );
}