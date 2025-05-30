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
    <div className="form-consultas">
      <div className="form-container-consultas">
        <h2 className="titulo">Formulario de Consultas</h2>
        <form onSubmit={handleSubmit} className="formularioConsulta">
          <div className="grupoCampo">
            <label className="labelConsulta" htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              className="inputConsultas"
              value={nombre}
              placeholder="Ingrese su Nombre"
              readOnly
            />
          </div>

          <div className="grupoCampo">
            <label className="labelConsulta" htmlFor="mail">Mail</label>
            <input
              id="mail"
              type="text"
              className="inputConsultas"
              value={mail}
              placeholder="Ingrese su Mail"
              readOnly
            />
          </div>

          <div className="grupoCampo" style={{ gridColumn: "1 / -1" }}>
            <label className="labelConsulta" htmlFor="problema">Problema/consulta</label>
            <textarea
              id="problema"
              placeholder="Ingrese su Consulta"
              value={problema}
              onChange={(e) => setProblema(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="grupoCampo centered" style={{ gridColumn: "1 / -1" }}>
            <button className="enviarConsulta" type="submit">Enviar</button>
          </div>

          {mensaje && <p className="mensaje">{mensaje}</p>}
        </form>

        <hr />
      </div>
      
    </div>
  );
}

export default FormularioConsultas;
