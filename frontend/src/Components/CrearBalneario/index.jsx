import { useEffect, useState } from "react";
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

  const [ciudades, setCiudades] = useState([]);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    // Traer ciudades desde el backend (no desde supabase directo)
    fetch("http://localhost:3000/api/ciudades")
      .then(res => res.json())
      .then(data => setCiudades(data))
      .catch(err => setMensaje("Error al obtener ciudades."));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    // Traer usuario del localStorage
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || !usuario.auth_id) {
      setMensaje("Sesión no válida.");
      return;
    }

    if (!ciudadSeleccionada) {
      setMensaje("Debe seleccionar una ciudad.");
      return;
    }

    const body = {
      nombre,
      direccion,
      telefono,
      imagenUrl,
      cantidadCarpas,
      cantSillas,
      cantMesas,
      cantReposeras,
      capacidad,
      ciudadSeleccionada,
      idUsuario: usuario.auth_id
    };

    try {
      const res = await fetch("http://localhost:3000/api/crear-balneario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const result = await res.json();

      if (!res.ok) {
        setMensaje(result.error || "Error al guardar. Intente nuevamente.");
        return;
      }

      window.location.href = "/tusbalnearios";
    } catch (err) {
      setMensaje("Error al guardar. Intente nuevamente.");
    }
  };

  return (
    <div className="form-consultas">
      <div className="form-layout">
        <div className="form-container-consultas">
          <h1 className="titulo">Agregar nuevo Balneario</h1>
          <form onSubmit={handleSubmit} className="formulario">
            <div className="form-section">
              <h3>Configuración del balneario</h3>
              <label htmlFor="nombre">Nombre</label>
              <input id="nombre" type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              <label htmlFor="direccion">Dirección</label>
              <input id="direccion" type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
              <label htmlFor="telefono">Teléfono</label>
              <input id="telefono" type="number" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
              <label htmlFor="imagenUrl">Imagen URL</label>
              <input id="imagenUrl" type="text" value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} />
              <label htmlFor="ciudad">Ciudad</label>
              <select id="ciudad" value={ciudadSeleccionada} onChange={(e) => setCiudadSeleccionada(e.target.value)} required>
                <option value="">Seleccione una ciudad</option>
                {ciudades.map((ciudad) => (
                  <option key={ciudad.id_ciudad} value={ciudad.id_ciudad}>{ciudad.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-section">
              <h3>Configuración de carpas</h3>
              <label htmlFor="cantidadCarpas">Cantidad de carpas</label>
              <input id="cantidadCarpas" type="number" value={cantidadCarpas} onChange={(e) => setCantidadCarpas(parseInt(e.target.value) || 0)} required />
              <label htmlFor="sillas">Cantidad de sillas</label>
              <input id="sillas" type="number" value={cantSillas} onChange={(e) => setCantSillas(parseInt(e.target.value) || 0)} required />
              <label htmlFor="mesas">Cantidad de mesas</label>
              <input id="mesas" type="number" value={cantMesas} onChange={(e) => setCantMesas(parseInt(e.target.value) || 0)} required />
              <label htmlFor="reposeras">Cantidad de reposeras</label>
              <input id="reposeras" type="number" value={cantReposeras} onChange={(e) => setCantReposeras(parseInt(e.target.value) || 0)} required />
              <label htmlFor="capacidad">Capacidad por carpa</label>
              <input id="capacidad" type="number" value={capacidad} onChange={(e) => setCapacidad(parseInt(e.target.value) || 0)} required />
            </div>
            <div className="boton-contenedor">
              <button className="enviar" type="submit">Enviar</button>
            </div>
          </form>
          {mensaje && <p className="mensaje">{mensaje}</p>}
        </div>
      </div>
    </div>
  );
}

export default CrearBalneario;