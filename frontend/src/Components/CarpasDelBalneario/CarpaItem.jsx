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
  handleEditarCarpa,
  fechaInicio,
  fechaFin,
  idBalneario,
  onReservarManual
}) {
  return (
    <div
      key={carpa.id_carpa}
      className={`carpa ${carpaReservada(carpa.id_carpa) ? "reservada" : "libre"} tipo-${tipo}`}
      style={{ left: `${left}px`, top: `${top}px` }}
      onMouseDown={(e) => {
        if (!esDuenio) return;
        e.stopPropagation();
        // Guardar posición original para poder revertir si hay colisión
        setDragging({ tipo: "carpa", id: carpa.id_carpa, origX: carpa.x, origY: carpa.y });
      }}
      onClick={() => {
        // Dueño: el click en la carpa no reserva; usar el botón pequeño
        if (esDuenio) return;
        // Usuario: puede navegar para reservar si está libre
        if (!esDuenio && usuarioLogueado && !carpaReservada(carpa.id_carpa)) {
          navigate(`/reservaubicacion/${carpa.id_carpa}`, {
            state: { fechaInicio, fechaFin, id_balneario: idBalneario }
          });
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
            {/* Reserva manual desde botón pequeño */}
            <button
              className="boton-agregar-servicio"
              title="Reserva manual"
              onClick={e => {
                e.stopPropagation();
                if (onReservarManual && !carpaReservada(carpa.id_carpa)) {
                  onReservarManual(carpa);
                }
              }}
            >
              <FontAwesomeIcon icon="fa-solid fa-calendar-days" />
            </button>
            <button
              className="boton-agregar-servicio"
              onClick={e => {
                e.stopPropagation();
                eliminarCarpa(carpa.id_carpa);
              }}
            >
              <FontAwesomeIcon icon="fa-solid fa-trash" />
            </button>
            <button
              className="boton-agregar-servicio"
              onClick={e => {
                e.stopPropagation();
                handleEditarCarpa(carpa);
              }}
            >
              <FontAwesomeIcon icon="fa-solid fa-pen-to-square" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default CarpaItem;