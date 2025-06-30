import React from "react";

function PreciosBalnearioTabla({ precios, esDuenio, abrirModalPrecio }) {
  if (!precios || precios.length === 0) return null;
  return (
    <div className="precios-balneario-tabla" style={{ marginTop: "2em" }}>
      <h3>Disponibilidad</h3>
      <table className="tabla-precios-reserva">
        <thead>
          <tr>
            <th>Tipo de reserva</th>
            <th>Precio por día</th>
            <th>Precio por semana</th>
            <th>Precio por quincena</th>
            <th>Precio por mes</th>
            {esDuenio && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {precios.map((p) => (
            <tr key={p.id_tipo_ubicacion}>
              <td>{p.nombre}</td>
              <td>${p.dia}</td>
              <td>${p.semana}</td>
              <td>${p.quincena}</td>
              <td>${p.mes}</td>
              {esDuenio && (
                <td>
                  <button
                    className="boton-agregar-servicio"
                    onClick={() => abrirModalPrecio(p)}
                  >
                    Editar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PreciosBalnearioTabla;