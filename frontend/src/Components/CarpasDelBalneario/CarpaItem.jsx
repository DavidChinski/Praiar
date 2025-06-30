import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function CarpaItem({
  carpa,
  tipo,
  left,
  top,
  esDuenio,
  dragging,
  setDragging,
  carpaReservada,
  usuarioLogueado,
  navigate,
  eliminarCarpa,
  handleEditarCarpa
}) {
  return (
    <div
      key={carpa.id_carpa}
      className={`carpa ${carpaReservada(carpa.id_carpa) ? "reservada" : "libre"} tipo-${tipo}`}
      style={{ left: `${left}px`, top: `${top}px` }}
      onMouseDown={() =>
        esDuenio && setDragging({ tipo: "carpa", id: carpa.id_carpa })
      }
      onClick={() => {
        if (!esDuenio && usuarioLogueado && !carpaReservada(carpa.id_carpa)) {
          navigate(`/reservaubicacion/${carpa.id_carpa}`);
        }
      }}
      title={`Sillas: ${carpa.cant_sillas ?? "-"}, Mesas: ${carpa.cant_mesas ?? "-"}, Reposeras: ${carpa.cant_reposeras ?? "-"}, Capacidad: ${carpa.capacidad ?? "-"}`}
    >
      <div className="carpa-posicion">{carpa.posicion}</div>
      {tipo === "doble" ? (
        <FontAwesomeIcon
          icon="fa-solid fa-tents"
          alt={`Carpa doble ${carpa.posicion}`}
          className="carpa-imagen"
          style={{ opacity: carpaReservada(carpa.id_ubicacion) ? 0.6 : 1 }}
        />
      ) : tipo === "sombrilla" ? (
        <FontAwesomeIcon
          icon="fa-solid fa-umbrella-beach"
          alt={`Sombrilla ${carpa.posicion}`}
          className="carpa-imagen"
          style={{ opacity: carpaReservada(carpa.id_ubicacion) ? 0.6 : 1 }}
        />
      ) : (
        <FontAwesomeIcon
          icon="fa-solid fa-tent"
          alt={`Carpa ${carpa.posicion}`}
          className="carpa-imagen"
          style={{ opacity: carpaReservada(carpa.id_ubicacion) ? 0.6 : 1 }}
        />
      )}
      <div className="acciones">
        {esDuenio && (
          <>
            <button className="boton-agregar-servicio" onClick={() => eliminarCarpa(carpa.id_carpa)}>🗑</button>
            <button className="boton-agregar-servicio" onClick={() => handleEditarCarpa(carpa)}>✏️</button>
          </>
        )}
      </div>
    </div>
  );
}

export default CarpaItem;