import { useState } from "react";
import { supabase } from "../../supabaseClient";
import "./CrearBalneario.css";

function CrearBalneario() {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      setMensaje("Usuario no identificado.");
      return;
    }

    const { error } = await supabase.from("balnearios").insert([
      {
        nombre,
        direccion,
        telefono,
        imagen: imagenUrl,
        id_usuario: usuario.id_usuario,
      },
    ]);

    if (error) {
      console.error("Error al agregar balneario:", error.message);
      setMensaje("Error al guardar. Intente nuevamente.");
    } else {
      // Redirige y recarga la página completamente
      window.location.href = "/tusbalnearios";
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <h2 className="titulo">Agregar nuevo Balneario</h2>
        <form onSubmit={handleSubmit} className="formulario">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            type="text"
            placeholder="Ingrese el nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <label htmlFor="direccion">Dirección</label>
          <input
            id="direccion"
            type="text"
            placeholder="Ingrese la dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            required
          />

          <label htmlFor="telefono">Teléfono</label>
          <input
            id="telefono"
            type="number"
            placeholder="Ingrese el teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />

          <label htmlFor="imagenUrl">Imagen URL</label>
          <input
            id="imagenUrl"
            type="text"
            placeholder="Ingrese una URL de imagen"
            value={imagenUrl}
            onChange={(e) => setImagenUrl(e.target.value)}
          />

          <button className="enviar" type="submit">Enviar</button>

          {mensaje && <p className="mensaje">{mensaje}</p>}
        </form>
      </div>

      <hr />
    </div>
  );
}

export default CrearBalneario;
