import React from "react";

function ServiciosSection({
  balnearioInfo,
  esDuenio,
  mostrarModalServicios,
  setMostrarModalServicios,
  todosLosServicios,
  toggleServicio
}) {
  return (
    <div className="iconos-servicios" style={{ marginTop: "2em" }}>
      <h3 className="titulo-servicio">Servicios</h3>
      {balnearioInfo?.servicios?.length > 0 ? (
        <div className="servicios-lista">
          {balnearioInfo.servicios.map((servicio) => (
            <div key={servicio.id_servicio} className="servicio-icono">
              <img src={servicio.imagen} className="icono-imagen" />
              <span>{servicio.nombre}</span>
            </div>
          ))}
        </div>
      ) : (
        <p>No hay servicios cargados para este balneario.</p>
      )}

      {esDuenio && (
        <>
          <button
            className="boton-agregar-servicio"
            onClick={() => setMostrarModalServicios(true)}
          >
            Agrega un Servicio
          </button>

          {mostrarModalServicios && (
            <div className="modal-servicios">
              <div className="modal-content-servicios">
                <h3>Editar Servicios del Balneario</h3>
                <div className="servicios-lista">
                  {todosLosServicios.map(serv => {
                    const tieneServicio = balnearioInfo.servicios?.some(s => s.id_servicio === serv.id_servicio);
                    return (
                      <div key={serv.id_servicio} className={`servicio-icono ${tieneServicio ? 'activo' : ''}`}>
                        <img src={serv.imagen} className="icono-imagen" />
                        <span>{serv.nombre}</span>
                        <button
                          className="boton-agregar-servicio"
                          onClick={() => toggleServicio(serv.id_servicio, tieneServicio)}
                        >
                          {tieneServicio ? "Quitar" : "Agregar"}
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="modal-buttons-servicios">
                  <button className="boton-agregar-servicio" onClick={() => setMostrarModalServicios(false)}>Cerrar</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ServiciosSection;