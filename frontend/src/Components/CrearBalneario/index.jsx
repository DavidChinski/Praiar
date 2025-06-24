import { useEffect, useState } from "react";
import "./CrearBalneario.css";

function CrearBalneario() {
  // Balneario
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("");
  const [ciudades, setCiudades] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // Carpa (tanda actual)
  const [cantidadCarpas, setCantidadCarpas] = useState(0);
  const [cantSillas, setCantSillas] = useState(2);
  const [cantMesas, setCantMesas] = useState(1);
  const [cantReposeras, setCantReposeras] = useState(2);
  const [capacidad, setCapacidad] = useState(4);
  const [tipoUbicacion, setTipoUbicacion] = useState("");
  const [tiposUbicacion, setTiposUbicacion] = useState([]);

  // Todas las tandas cargadas
  const [tandasCarpas, setTandasCarpas] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/ciudades")
      .then(res => res.json())
      .then(data => setCiudades(data))
      .catch(() => setMensaje("Error al obtener ciudades."));

    fetch("http://localhost:3000/api/tipos-ubicaciones")
      .then(res => res.json())
      .then(data => setTiposUbicacion(data))
      .catch(() => setMensaje("Error al obtener tipos de ubicación."));
  }, []);

  // 1. Agregar una tanda de carpas a la lista local
  const handleAgregarTanda = (e) => {
    e.preventDefault();
    if (!tipoUbicacion) {
      setMensaje("Debe seleccionar un tipo de carpa.");
      return;
    }
    if (cantidadCarpas <= 0) {
      setMensaje("Debe ingresar la cantidad de carpas.");
      return;
    }
    setTandasCarpas([
      ...tandasCarpas,
      {
        id_tipo_ubicacion: tipoUbicacion,
        cantidadCarpas,
        cantSillas,
        cantMesas,
        cantReposeras,
        capacidad
      }
    ]);
    // Resetear form de carpas para cargar otra tanda
    setTipoUbicacion("");
    setCantidadCarpas(0);
    setCantSillas(2);
    setCantMesas(1);
    setCantReposeras(2);
    setCapacidad(4);
    setMensaje("");
  };

  // 2. Enviar todo al backend
  const handleFinalizar = async (e) => {
    e.preventDefault();
    setMensaje("");
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || !usuario.auth_id) {
      setMensaje("Sesión no válida.");
      return;
    }
    if (!ciudadSeleccionada) {
      setMensaje("Debe seleccionar una ciudad.");
      return;
    }
    if (tandasCarpas.length === 0) {
      setMensaje("Debe agregar al menos una tanda de carpas.");
      return;
    }

    const body = {
      nombre,
      direccion,
      telefono,
      imagenUrl,
      ciudadSeleccionada,
      idUsuario: usuario.auth_id,
      tandasCarpas // array de todas las tandas
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

          {/* Formulario datos del balneario */}
          <form onSubmit={handleFinalizar} className="formulario">
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
            {/* Formulario de carpa (tanda) */}
            <div className="form-section">
              <h3>Agregar tanda de carpas</h3>
              <label htmlFor="tipoUbicacion">Tipo de carpa</label>
              <select id="tipoUbicacion" value={tipoUbicacion} onChange={(e) => setTipoUbicacion(e.target.value)}>
                <option value="">Seleccione tipo</option>
                {tiposUbicacion.map((tipo) => (
                  <option key={tipo.id_tipo_ubicaciones} value={tipo.id_tipo_ubicaciones}>{tipo.nombre}</option>
                ))}
              </select>
              <label htmlFor="cantidadCarpas">Cantidad de carpas</label>
              <input id="cantidadCarpas" type="number" value={cantidadCarpas} onChange={(e) => setCantidadCarpas(parseInt(e.target.value) || 0)} />
              <label htmlFor="sillas">Cantidad de sillas</label>
              <input id="sillas" type="number" value={cantSillas} onChange={(e) => setCantSillas(parseInt(e.target.value) || 0)} />
              <label htmlFor="mesas">Cantidad de mesas</label>
              <input id="mesas" type="number" value={cantMesas} onChange={(e) => setCantMesas(parseInt(e.target.value) || 0)} />
              <label htmlFor="reposeras">Cantidad de reposeras</label>
              <input id="reposeras" type="number" value={cantReposeras} onChange={(e) => setCantReposeras(parseInt(e.target.value) || 0)} />
              <label htmlFor="capacidad">Capacidad por carpa</label>
              <input id="capacidad" type="number" value={capacidad} onChange={(e) => setCapacidad(parseInt(e.target.value) || 0)} />
              <button type="button" onClick={handleAgregarTanda}>Agregar tanda</button>
            </div>
            {/* Mostrar las tandas cargadas */}
            {tandasCarpas.length > 0 && (
              <div>
                <h4>Tandas agregadas</h4>
                <ul>
                  {tandasCarpas.map((t, idx) => (
                    <li key={idx}>
                      {tiposUbicacion.find(x => x.id_tipo_ubicaciones == t.id_tipo_ubicacion)?.nombre || "Tipo"}: {t.cantidadCarpas} carpas
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="boton-contenedor">
              <button className="enviar" type="submit">Finalizar y crear balneario</button>
            </div>
          </form>
          {mensaje && <p className="mensaje">{mensaje}</p>}
        </div>
      </div>
    </div>
  );
}

export default CrearBalneario;