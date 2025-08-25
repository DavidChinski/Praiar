import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function ElementoItem({ el, esDuenio, setDragging, rotarElemento }) {
  return (
    <div
      key={el.id_elemento}
      className={`elemento tipo-${el.tipo}`}
      style={{
        left: `${el.x}px`,
        top: `${el.y}px`,
        transform: `rotate(${el.rotado || 0}deg)`,
        transformOrigin: 'center center',
        position: 'absolute'
      }}
      onMouseDown={() =>
        esDuenio && setDragging({ tipo: "elemento", id: el.id_elemento, origX: el.x, origY: el.y })
      }
      title={el.tipo}
    >
      {el.tipo}
      {esDuenio && (
        <div className="acciones">
          <button className="boton-agregar-servicio" onClick={() => rotarElemento(el.id_elemento)}>
            <FontAwesomeIcon icon="fa-solid fa-rotate-right" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ElementoItem;