import React, { useState } from "react";

function AgregarCarpaModal({
  mostrarAgregarCarpa,
  setMostrarAgregarCarpa,
  nuevaCarpa,
  setNuevaCarpa,
  tiposUbicacion,
  handleAgregarCarpa,
  precios,
  onAgregarPrecio
}) {
  const [nuevoPrecio, setNuevoPrecio] = useState({ dia: "", semana: "", quincena: "", mes: "" });

  if (!mostrarAgregarCarpa) return null;

  const tipoTienePrecio =
    !!nuevaCarpa.id_tipo_ubicacion &&
    precios.some(
      (p) =>
        p.id_tipo_ubicacion !== undefined &&
        String(p.id_tipo_ubicacion) === String(nuevaCarpa.id_tipo_ubicacion)
    );

  // Handler para agregar precio y luego la carpa
  const agregarConPrecio = async () => {
    if (!nuevoPrecio.dia || !nuevoPrecio.semana || !nuevoPrecio.quincena || !nuevoPrecio.mes) {
      alert("Debe completar todos los precios.");
      return;
    }
    // Guardar precio y, solo si fue correcto, agregar la carpa
    const ok = await onAgregarPrecio({
      id_tipo_ubicacion: nuevaCarpa.id_tipo_ubicacion,
      ...nuevoPrecio
    });
    if (ok) {
      setNuevoPrecio({ dia: "", semana: "", quincena: "", mes: "" });
      handleAgregarCarpa();
    }
  };

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

        {/* SOLO SI NO TIENE PRECIO ESE TIPO, MOSTRAR CAMPOS DE PRECIO */}
        {!tipoTienePrecio && nuevaCarpa.id_tipo_ubicacion &&
          <>
            <h4>Debe ingresar los precios para este tipo de ubicación</h4>
            <label>
              Precio por día:
              <input type="number" value={nuevoPrecio.dia}
                onChange={e => setNuevoPrecio(p => ({ ...p, dia: e.target.value }))}
                min={1} required />
            </label>
            <label>
              Precio por semana:
              <input type="number" value={nuevoPrecio.semana}
                onChange={e => setNuevoPrecio(p => ({ ...p, semana: e.target.value }))}
                min={1} required />
            </label>
            <label>
              Precio por quincena:
              <input type="number" value={nuevoPrecio.quincena}
                onChange={e => setNuevoPrecio(p => ({ ...p, quincena: e.target.value }))}
                min={1} required />
            </label>
            <label>
              Precio por mes:
              <input type="number" value={nuevoPrecio.mes}
                onChange={e => setNuevoPrecio(p => ({ ...p, mes: e.target.value }))}
                min={1} required />
            </label>
          </>
        }

        <div className="modal-buttons">
          {tipoTienePrecio
            ? <button className="boton-agregar-servicio" onClick={handleAgregarCarpa}>Agregar</button>
            : (nuevaCarpa.id_tipo_ubicacion &&
              <button className="boton-agregar-servicio" onClick={agregarConPrecio}>Agregar y guardar precio</button>
            )
          }
          <button className="boton-agregar-servicio" onClick={() => setMostrarAgregarCarpa(false)}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default AgregarCarpaModal;