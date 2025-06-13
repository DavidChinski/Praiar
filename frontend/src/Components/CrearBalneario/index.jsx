import { useEffect, useState } from "react";
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

  const [ciudades, setCiudades] = useState([]);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("");

  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function fetchCiudades() {
      const { data, error } = await supabase
        .from("ciudades")
        .select("id_ciudad, nombre");
      if (error) {
        console.error("Error al obtener ciudades:", error.message);
      } else {
        setCiudades(data);
      }
    }
    fetchCiudades();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData?.user) {
      console.error("No se pudo obtener el usuario autenticado");
      setMensaje("Sesión no válida.");
      return;
    }

    const idUsuario = userData.user.id;

    if (!ciudadSeleccionada) {
      setMensaje("Debe seleccionar una ciudad.");
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
          id_usuario: idUsuario,
          id_ciudad: ciudadSeleccionada,
        },
      ])
      .select();

    if (error) {
      console.error("Error al agregar balneario:", error.message);
      setMensaje("Error al guardar. Intente nuevamente.");
      return;
    }

    const nuevoBalnearioId = data[0].id_balneario;

    // Crear carpas con posiciones x,y calculadas
    const carpas = Array.from({ length: cantidadCarpas }, (_, i) => {
      const maxPorFila = 10;
      const anchoCarpa = 100; // ancho entre carpas
      const altoCarpa = 100;  // alto entre filas

      const fila = Math.floor(i / maxPorFila);
      const columna = i % maxPorFila;

      return {
        id_balneario: nuevoBalnearioId,
        posicion: i + 1,
        reservado: false,
        cant_sillas: cantSillas,
        cant_mesas: cantMesas,
        cant_reposeras: cantReposeras,
        capacidad: capacidad,
        id_usuario: idUsuario,
        x: columna * anchoCarpa,
        y: fila * altoCarpa,
      };
    });

    const { error: errorCarpas } = await supabase
      .from("ubicaciones")
      .insert(carpas);

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
          <h1 className="titulo">Agregar nuevo Balneario</h1>

          <form onSubmit={handleSubmit} className="formulario">
            <div className="form-section">
              <h3>Configuración del balneario</h3>
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />

              <label htmlFor="direccion">Dirección</label>
              <input
                id="direccion"
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
              />

              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                type="number"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
              />

              <label htmlFor="imagenUrl">Imagen URL</label>
              <input
                id="imagenUrl"
                type="text"
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
              />

              <label htmlFor="ciudad">Ciudad</label>
              <select
                id="ciudad"
                value={ciudadSeleccionada}
                onChange={(e) => setCiudadSeleccionada(e.target.value)}
                required
              >
                <option value="">Seleccione una ciudad</option>
                {ciudades.map((ciudad) => (
                  <option key={ciudad.id_ciudad} value={ciudad.id_ciudad}>
                    {ciudad.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-section">
              <h3>Configuración de carpas</h3>

              <label htmlFor="cantidadCarpas">Cantidad de carpas</label>
              <input
                id="cantidadCarpas"
                type="number"
                value={cantidadCarpas}
                onChange={(e) => setCantidadCarpas(parseInt(e.target.value) || 0)}
                required
              />

              <label htmlFor="sillas">Cantidad de sillas</label>
              <input
                id="sillas"
                type="number"
                value={cantSillas}
                onChange={(e) => setCantSillas(parseInt(e.target.value) || 0)}
                required
              />

              <label htmlFor="mesas">Cantidad de mesas</label>
              <input
                id="mesas"
                type="number"
                value={cantMesas}
                onChange={(e) => setCantMesas(parseInt(e.target.value) || 0)}
                required
              />

              <label htmlFor="reposeras">Cantidad de reposeras</label>
              <input
                id="reposeras"
                type="number"
                value={cantReposeras}
                onChange={(e) => setCantReposeras(parseInt(e.target.value) || 0)}
                required
              />

              <label htmlFor="capacidad">Capacidad por carpa</label>
              <input
                id="capacidad"
                type="number"
                value={capacidad}
                onChange={(e) => setCapacidad(parseInt(e.target.value) || 0)}
                required
              />
            </div>
          </form>

          <div className="boton-contenedor">
            <button className="enviar" type="submit" onClick={handleSubmit}>
              Enviar
            </button>
          </div>

          {mensaje && <p className="mensaje">{mensaje}</p>}
        </div>
      </div>
    </div>
  );
}

export default CrearBalneario;
