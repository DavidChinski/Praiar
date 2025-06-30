import React from "react";

function EditarCarpaModal({ carpaEditando, handleInputChange, guardarCambios, setCarpaEditando }) {
  if (!carpaEditando) return null;
  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Editando Carpa #{carpaEditando.posicion}</h3>
        <label>
          Sillas: <input name="cant_sillas" type="number" value={carpaEditando.cant_sillas || ''} onChange={handleInputChange} />
        </label>
        <label>
          Mesas: <input name="cant_mesas" type="number" value={carpaEditando.cant_mesas || ''} onChange={handleInputChange} />
        </label>
        <label>
          Reposeras: <input name="cant_reposeras" type="number" value={carpaEditando.cant_reposeras || ''} onChange={handleInputChange} />
        </label>
        <label>
          Capacidad: <input name="capacidad" type="number" value={carpaEditando.capacidad || ''} onChange={handleInputChange} />
        </label>
        <div className="modal-buttons">
          <button className="boton-agregar-servicio" onClick={guardarCambios}>Guardar</button>
          <button className="boton-agregar-servicio" onClick={() => setCarpaEditando(null)}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default EditarCarpaModal;