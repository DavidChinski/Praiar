import { useState, useEffect } from "react";
import "./FormularioConsultas.css";

function FormularioConsultas() {
  const [nombre, setNombre] = useState("");
  const [mail, setMail] = useState("");
  const [problema, setProblema] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem("usuario"));
    if (localUser && localUser.auth_id) {
      setUsuario(localUser);
      setNombre(localUser.nombre || "");
      setMail(localUser.email || "");
    } else {
      setMensaje("Usuario no autenticado.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuario) {
      setMensaje("Usuario no autenticado.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/consultas", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({
          nombre,
          mail,
          problema,
          id_usuario: usuario.auth_id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar la consulta.");
      }

      window.location.href = "/";
    } catch (err) {
      console.error("Error al enviar consulta:", err.message);
      setMensaje("Error al guardar. Intente nuevamente.");
    }
  };

  return (
    <div className="form-consultas">
      <div className="form-container-consultas">
        <h2 className="titulo">Formulario de Consultas</h2>
        <form onSubmit={handleSubmit} className="formularioConsulta">
          <div className="grupoCampo">
            <label className="labelConsulta" htmlFor="nombre">Nombre</label>
            <input id="nombre" type="text" className="inputConsultas" value={nombre} readOnly />
          </div>

          <div className="grupoCampo">
            <label className="labelConsulta" htmlFor="mail">Mail</label>
            <input id="mail" type="text" className="inputConsultas" value={mail} readOnly />
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
