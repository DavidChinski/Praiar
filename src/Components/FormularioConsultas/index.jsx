import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import "./FormularioConsultas.css";

function FormularioConsultas() {
  const [nombre, setNombre] = useState("");
  const [mail, setMail] = useState("");
  const [problema, setProblema] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    // Al cargar el componente, obtener datos del usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario) {
      setNombre(usuario.nombre);
      setMail(usuario.mail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      setMensaje("Usuario no identificado.");
      return;
    }

    const { error } = await supabase.from("consultas").insert([
      {
        nombre_usuario: usuario.nombre,
        mail_usuario: usuario.mail,
        problema,
        id_usuario: usuario.id_usuario,
      },
    ]);

    if (error) {
      console.error("Error al agregar consulta:", error.message);
      setMensaje("Error al guardar. Intente nuevamente.");
    } else {
      window.location.href = "/tusbalnearios";
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <h2 className="titulo">Formulario de Consultas</h2>
        <form onSubmit={handleSubmit} className="formulario">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            type="text"
            className="inputConsultas"
            value={nombre}
            readOnly
          />

          <label htmlFor="mail">Email</label>
          <input
            id="mail"
            type="email"
            className="inputConsultas"
            value={mail}
            readOnly
          />

          <label htmlFor="problema">Problema</label>
          <textarea
            id="problema"
            placeholder="Describe tu problema"
            value={problema}
            onChange={(e) => setProblema(e.target.value)}
            required
          ></textarea>

          <button className="enviar" type="submit">Enviar</button>

          {mensaje && <p className="mensaje">{mensaje}</p>}
        </form>
      </div>
      <hr />
    </div>
  );
}

export default FormularioConsultas;
