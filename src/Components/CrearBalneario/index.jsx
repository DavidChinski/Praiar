import { useState } from "react";
import { supabase } from "../../supabaseClient";
import "./CrearBalneario.css";

function CrearBalneario() {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [cantidadCarpas, setCantidadCarpas] = useState(0);

  const [cantSillas, setCantSillas] = useState(2);
  const [cantMesas, setCantMesas] = useState(1);
  const [cantReposeras, setCantReposeras] = useState(2);
  const [capacidad, setCapacidad] = useState(4);

  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) {
      setMensaje("Usuario no identificado.");
      return;
    }

    // Insertar balneario
    const { data, error } = await supabase
      .from("balnearios")
      .insert([
        {
          nombre,
          direccion,
          telefono,
          imagen: imagenUrl,
          id_usuario: usuario.id_usuario,
        },
      ])
      .select();

    if (error) {
      console.error("Error al agregar balneario:", error.message);
      setMensaje("Error al guardar. Intente nuevamente.");
      return;
    }

    const nuevoBalnearioId = data[0].id_balneario;

    // Crear carpas
    const carpas = Array.from({ length: cantidadCarpas }, (_, i) => ({
      id_balneario: nuevoBalnearioId,
      posicion: i + 1,
      reservado: false,
      cant_sillas: cantSillas,
      cant_mesas: cantMesas,
      cant_reposeras: cantReposeras,
      capacidad: capacidad,
    }));

    const { error: errorCarpas } = await supabase.from("ubicaciones").insert(carpas);

    if (errorCarpas) {
      console.error("Error al agregar carpas:", errorCarpas.message);
      setMensaje("Balneario creado, pero ocurrió un error al crear las carpas.");
      return;
    }

    window.location.href = "/tusbalnearios";
  };

  return (
    <div className="form-consultas">
  <div className="form-layout">
    <div className="form-container-consultas">
      <h2 className="titulo">Agregar nuevo Balneario</h2>

      <form onSubmit={handleSubmit} className="formulario">
        {/* Columna izquierda */}
        <div className="columna-izquierda">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

          <label htmlFor="direccion">Dirección</label>
          <input id="direccion" type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />

          <label htmlFor="telefono">Teléfono</label>
          <input id="telefono" type="number" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />

          <label htmlFor="imagenUrl">Imagen URL</label>
          <input id="imagenUrl" type="text" value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} />
        </div>

        {/* Columna derecha */}
        <div className="columna-derecha">
          <h3>Configuración de carpas</h3>
          <div className="carpa-grid">
            <label htmlFor="cantidadCarpas">Cantidad de carpas</label>
            <input id="cantidadCarpas" type="number" value={cantidadCarpas} onChange={(e) => setCantidadCarpas(parseInt(e.target.value))} required />

            <label htmlFor="sillas">Cantidad de sillas</label>
            <input id="sillas" type="number" value={cantSillas} onChange={(e) => setCantSillas(parseInt(e.target.value))} required />

            <label htmlFor="mesas">Cantidad de mesas</label>
            <input id="mesas" type="number" value={cantMesas} onChange={(e) => setCantMesas(parseInt(e.target.value))} required />

            <label htmlFor="reposeras">Cantidad de reposeras</label>
            <input id="reposeras" type="number" value={cantReposeras} onChange={(e) => setCantReposeras(parseInt(e.target.value))} required />

            <label htmlFor="capacidad">Capacidad por carpa</label>
            <input id="capacidad" type="number" value={capacidad} onChange={(e) => setCapacidad(parseInt(e.target.value))} required />
          </div>

          {/* Botón dentro de la columna derecha */}
          <button className="enviar" type="submit">Enviar</button>
        </div>
      </form>

      {/* Mensaje de éxito */}
      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  </div>
</div>

  );
}

export default CrearBalneario;
