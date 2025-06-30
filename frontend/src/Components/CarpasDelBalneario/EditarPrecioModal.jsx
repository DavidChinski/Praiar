import React from "react";

function EditarPrecioModal({ editandoPrecio, precioEdit, setPrecioEdit, guardarPrecio, setEditandoPrecio }) {
  if (!editandoPrecio) return null;
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Editar precio: {editandoPrecio.nombre}</h3>
        <label>
          Día:
          <input
            type="number"
            value={precioEdit.dia}
            onChange={e =>
              setPrecioEdit(pe => ({ ...pe, dia: e.target.value }))
            }
            min={0}
          />
        </label>
        <label>
          Semana:
          <input
            type="number"
            value={precioEdit.semana}
            onChange={e =>
              setPrecioEdit(pe => ({ ...pe, semana: e.target.value }))
            }
            min={0}
          />
        </label>
        <label>
          Quincena:
          <input
            type="number"
            value={precioEdit.quincena}
            onChange={e =>
              setPrecioEdit(pe => ({ ...pe, quincena: e.target.value }))
            }
            min={0}
          />
        </label>
        <label>
          Mes:
          <input
            type="number"
            value={precioEdit.mes}
            onChange={e =>
              setPrecioEdit(pe => ({ ...pe, mes: e.target.value }))
            }
            min={0}
          />
        </label>
        <div className="modal-buttons">
          <button className="boton-agregar-servicio" onClick={guardarPrecio}>
            Guardar
          </button>
          <button
            className="boton-agregar-servicio"
            onClick={() => setEditandoPrecio(null)}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditarPrecioModal;