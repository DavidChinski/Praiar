import React, { useEffect, useRef } from 'react';

function renderInlineWithLinks(texto) {
  // Convierte URLs (http/https) y rutas absolutas (/algo) en enlaces clicables
  const tokens = texto.split(/(https?:\/\/\S+|\s+|\/[^\s]+)/g).filter(Boolean);
  return tokens.map((tok, i) => {
    const isSpace = /^\s+$/.test(tok);
    if (isSpace) return <span key={i}>{tok}</span>;

    const isHttp = /^https?:\/\//i.test(tok);
    const isRoute = /^\/[\w\-\/.?#=&%]+$/.test(tok);
    if (isHttp || isRoute) {
      const href = tok;
      return (
        <a key={i} href={href} target={isHttp ? '_blank' : undefined} rel={isHttp ? 'noopener noreferrer' : undefined}>
          {tok}
        </a>
      );
    }
    return <span key={i}>{tok}</span>;
  });
}

function formatearMensajeComoLista(texto) {
  // Detectar listas válidas SOLO si cada línea empieza con "- "
  const lineas = texto.split(/\r?\n/);
  const esLista = lineas.length >= 2 && lineas.every(l => l.trim().startsWith('- '));
  if (esLista) {
    return (
      <ul>
        {lineas.map((linea, i) => {
          const contenido = linea.trim().replace(/^-\s+/, '');
          return <li key={i}>{renderInlineWithLinks(contenido)}</li>;
        })}
      </ul>
    );
  }
  // Si no es lista, muestra como texto normal (con saltos de línea)
  return texto.split('\n').map((line, i) => <span key={i}>{renderInlineWithLinks(line)}<br /></span>);
}

export default function Chat({ mensajes = [], loading }) {
  const containerRef = useRef(null);

  // Auto-scroll al final cuando llegan nuevos mensajes o cambia el loading
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [mensajes, loading]);

  return (
    <div className="chat-mensajes" ref={containerRef}>
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