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

function isBulletList(lines) {
  return lines.length >= 2 && lines.every(l => l.trim().startsWith('- '));
}

function isNumberedList(lines) {
  const regex = /^\d+\.\s+/;
  if (lines.length < 2) return false;
  // Deben empezar con 1., 2., ... de forma consistente
  for (let i = 0; i < lines.length; i++) {
    if (!regex.test(lines[i].trim())) return false;
  }
  return true;
}

function renderParagraph(text) {
  return text.split('\n').map((line, i) => (
    <span key={i}>{renderInlineWithLinks(line)}<br /></span>
  ));
}

function renderBlock(block, index) {
  const lines = block.split(/\r?\n/).filter(l => l.length > 0);
  if (lines.length === 0) return null;

  // Título estilo "Sección:" en la primera línea
  const first = lines[0].trim();
  const isHeading = /:$/g.test(first) && !first.startsWith('- ') && !/^\d+\.\s+/.test(first);

  if (isHeading && lines.length === 1) {
    return <div key={index}><strong>{first}</strong></div>;
  }

  if (isHeading) {
    const rest = lines.slice(1);
    return (
      <div key={index}>
        <div><strong>{first}</strong></div>
        {isBulletList(rest) ? (
          <ul>
            {rest.map((l, i) => <li key={i}>{renderInlineWithLinks(l.trim().replace(/^-\s+/, ''))}</li>)}
          </ul>
        ) : isNumberedList(rest) ? (
          <ol>
            {rest.map((l, i) => <li key={i}>{renderInlineWithLinks(l.trim().replace(/^\d+\.\s+/, ''))}</li>)}
          </ol>
        ) : (
          renderParagraph(rest.join('\n'))
        )}
      </div>
    );
  }

  if (isBulletList(lines)) {
    return (
      <ul key={index}>
        {lines.map((l, i) => <li key={i}>{renderInlineWithLinks(l.trim().replace(/^-\s+/, ''))}</li>)}
      </ul>
    );
  }

  if (isNumberedList(lines)) {
    return (
      <ol key={index}>
        {lines.map((l, i) => <li key={i}>{renderInlineWithLinks(l.trim().replace(/^\d+\.\s+/, ''))}</li>)}
      </ol>
    );
  }

  return <div key={index}>{renderParagraph(block)}</div>;
}

function renderRichText(texto) {
  // Separar por bloques (doble salto de línea) para títulos/paragraphs
  const blocks = texto.split(/\n\s*\n/);
  return (
    <div>
      {blocks.map((b, idx) => renderBlock(b, idx))}
    </div>
  );
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
        let contenido = renderRichText(msg.texto);

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