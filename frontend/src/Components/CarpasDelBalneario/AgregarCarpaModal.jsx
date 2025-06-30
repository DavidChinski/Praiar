import React from "react";

function AgregarCarpaModal({
  mostrarAgregarCarpa,
  setMostrarAgregarCarpa,
  nuevaCarpa,
  setNuevaCarpa,
  tiposUbicacion,
  handleAgregarCarpa
}) {
  if (!mostrarAgregarCarpa) return null;
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Agregar carpa o sombrilla</h3>
        <label>
          Tipo:
          <select
            value={nuevaCarpa.id_tipo_ubicacion}
            onChange={e => setNuevaCarpa(nc => ({ ...nc, id_tipo_ubicacion: e.target.value }))}
          >
            <option value="">Seleccione tipo</option>
            {tiposUbicacion.map(t =>
              <option key={t.id_tipo_ubicaciones} value={t.id_tipo_ubicaciones}>{t.nombre}</option>
            )}
          </select>
        </label>
        <label>
          Sillas:
          <input type="number" value={nuevaCarpa.cant_sillas} min={0}
            onChange={e => setNuevaCarpa(nc => ({ ...nc, cant_sillas: +e.target.value }))} />
        </label>
        <label>
          Mesas:
          <input type="number" value={nuevaCarpa.cant_mesas} min={0}
            onChange={e => setNuevaCarpa(nc => ({ ...nc, cant_mesas: +e.target.value }))} />
        </label>
        <label>
          Reposeras:
          <input type="number" value={nuevaCarpa.cant_reposeras} min={0}
            onChange={e => setNuevaCarpa(nc => ({ ...nc, cant_reposeras: +e.target.value }))} />
        </label>
        <label>
          Capacidad:
          <input type="number" value={nuevaCarpa.capacidad} min={1}
            onChange={e => setNuevaCarpa(nc => ({ ...nc, capacidad: +e.target.value }))} />
        </label>
        <div className="modal-buttons">
          <button className="boton-agregar-servicio" onClick={handleAgregarCarpa}>Agregar</button>
          <button className="boton-agregar-servicio" onClick={() => setMostrarAgregarCarpa(false)}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default AgregarCarpaModal;