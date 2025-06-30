import React from "react";

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
        esDuenio && setDragging({ tipo: "elemento", id: el.id_elemento })
      }
      title={el.tipo}
    >
      {el.tipo}
      {esDuenio && (
        <div className="acciones">
          <button className="boton-agregar-servicio" onClick={() => rotarElemento(el.id_elemento)}>🔄</button>
        </div>
      )}
    </div>
  );
}

export default ElementoItem;