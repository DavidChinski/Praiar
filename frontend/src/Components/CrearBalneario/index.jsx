import { useEffect, useState } from "react";
import "./CrearBalneario.css";

function CrearBalneario() {
  // Balneario info
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("");
  const [ciudades, setCiudades] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // Tanda actual
  const [tipoUbicacion, setTipoUbicacion] = useState("");
  const [cantidadCarpas, setCantidadCarpas] = useState(0);
  const [cantSillas, setCantSillas] = useState(2);
  const [cantMesas, setCantMesas] = useState(1);
  const [cantReposeras, setCantReposeras] = useState(2);
  const [capacidad, setCapacidad] = useState(4);

  // Precios para la tanda actual
  const [precioDia, setPrecioDia] = useState("");
  const [precioSemana, setPrecioSemana] = useState("");
  const [precioQuincena, setPrecioQuincena] = useState("");
  const [precioMes, setPrecioMes] = useState("");

  // Catálogo de tipos y tandas ya agregadas
  const [tiposUbicacion, setTiposUbicacion] = useState([]);
  const [tandasCarpas, setTandasCarpas] = useState([]);
  const [preciosPorTipo, setPreciosPorTipo] = useState([]); // [{id_tipo_ubicacion, nombre, dia, semana, quincena, mes}]

  useEffect(() => {
    fetch("http://localhost:3000/api/ciudades")
      .then(res => res.json())
      .then(setCiudades)
      .catch(() => setMensaje("Error al obtener ciudades."));

    fetch("http://localhost:3000/api/tipos-ubicaciones")
      .then(res => res.json())
      .then(setTiposUbicacion)
      .catch(() => setMensaje("Error al obtener tipos de ubicación."));
  }, []);

  // Agregar tanda + precios para ese tipo
  const handleAgregarTanda = (e) => {
    e.preventDefault();
    if (!tipoUbicacion) return setMensaje("Debe seleccionar un tipo de carpa.");
    if (cantidadCarpas <= 0) return setMensaje("Debe ingresar la cantidad de carpas.");
    if (precioDia === "" || precioSemana === "" || precioQuincena === "" || precioMes === "") {
      return setMensaje("Debe ingresar todos los precios para este tipo.");
    }
    // Evitar duplicados de tipo
    if (tandasCarpas.some(t => t.id_tipo_ubicacion === tipoUbicacion)) {
      return setMensaje("Ya has agregado una tanda de este tipo.");
    }

    setTandasCarpas([...tandasCarpas, {
      id_tipo_ubicacion: tipoUbicacion,
      cantidadCarpas,
      cantSillas,
      cantMesas,
      cantReposeras,
      capacidad
    }]);
    setPreciosPorTipo([...preciosPorTipo, {
      id_tipo_ubicacion: tipoUbicacion,
      nombre: tiposUbicacion.find(t => t.id_tipo_ubicaciones == tipoUbicacion)?.nombre || "",
      dia: precioDia,
      semana: precioSemana,
      quincena: precioQuincena,
      mes: precioMes
    }]);
    // Reset
    setTipoUbicacion("");
    setCantidadCarpas(0);
    setCantSillas(2);
    setCantMesas(1);
    setCantReposeras(2);
    setCapacidad(4);
    setPrecioDia("");
    setPrecioSemana("");
    setPrecioQuincena("");
    setPrecioMes("");
    setMensaje("");
  };

  // Eliminar tanda/precios de un tipo ya agregado
  const handleEliminarTanda = (tipoId) => {
    setTandasCarpas(tandasCarpas.filter(t => t.id_tipo_ubicacion !== tipoId));
    setPreciosPorTipo(preciosPorTipo.filter(p => p.id_tipo_ubicacion !== tipoId));
  };

  // Enviar todo al backend
  const handleFinalizar = async (e) => {
    e.preventDefault();
    setMensaje("");
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || !usuario.auth_id) return setMensaje("Sesión no válida.");
    if (!ciudadSeleccionada) return setMensaje("Debe seleccionar una ciudad.");
    if (tandasCarpas.length === 0) return setMensaje("Debe agregar al menos una tanda de carpas.");
    // Validar que cada tanda tenga su precio
    if (tandasCarpas.some(tc => !preciosPorTipo.find(pt => pt.id_tipo_ubicacion === tc.id_tipo_ubicacion))) {
      return setMensaje("Debe ingresar los precios de todos los tipos agregados.");
    }
    // Validar precios completos
    if (preciosPorTipo.some(
      p => p.dia === "" || p.semana === "" || p.quincena === "" || p.mes === ""
    )) {
      return setMensaje("Debe ingresar todos los precios de cada tipo.");
    }

    const body = {
      nombre,
      direccion,
      telefono,
      imagenUrl,
      ciudadSeleccionada,
      idUsuario: usuario.auth_id,
      tandasCarpas,
      precios: preciosPorTipo
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

            {/* Formulario de carpa (tanda) + precios */}
            <div className="form-section">
              <h3>Agregar tanda de carpas/sombrillas</h3>
              <label htmlFor="tipoUbicacion">Tipo</label>
              <select id="tipoUbicacion" value={tipoUbicacion} onChange={(e) => setTipoUbicacion(e.target.value)}>
                <option value="">Seleccione tipo</option>
                {tiposUbicacion
                  .filter(tipo => !tandasCarpas.some(tc => tc.id_tipo_ubicacion == tipo.id_tipo_ubicaciones))
                  .map(tipo => (
                    <option key={tipo.id_tipo_ubicaciones} value={tipo.id_tipo_ubicaciones}>{tipo.nombre}</option>
                ))}
              </select>
              <label htmlFor="cantidadCarpas">Cantidad</label>
              <input id="cantidadCarpas" type="number" value={cantidadCarpas} onChange={e => setCantidadCarpas(parseInt(e.target.value) || 0)} />
              <label htmlFor="sillas">Sillas</label>
              <input id="sillas" type="number" value={cantSillas} onChange={e => setCantSillas(parseInt(e.target.value) || 0)} />
              <label htmlFor="mesas">Mesas</label>
              <input id="mesas" type="number" value={cantMesas} onChange={e => setCantMesas(parseInt(e.target.value) || 0)} />
              <label htmlFor="reposeras">Reposeras</label>
              <input id="reposeras" type="number" value={cantReposeras} onChange={e => setCantReposeras(parseInt(e.target.value) || 0)} />
              <label htmlFor="capacidad">Capacidad</label>
              <input id="capacidad" type="number" value={capacidad} onChange={e => setCapacidad(parseInt(e.target.value) || 0)} />

              {/* Precios para este tipo */}
              {tipoUbicacion && (
                <>
                  <div style={{marginTop:8, marginBottom:8, fontWeight:"bold"}}>
                    Precios para <span>
                      {tiposUbicacion.find(t => t.id_tipo_ubicaciones == tipoUbicacion)?.nombre || ""}
                    </span>
                  </div>
                  <label>Día
                    <input type="number" value={precioDia} min={0} onChange={e => setPrecioDia(e.target.value)} />
                  </label>
                  <label>Semana
                    <input type="number" value={precioSemana} min={0} onChange={e => setPrecioSemana(e.target.value)} />
                  </label>
                  <label>Quincena
                    <input type="number" value={precioQuincena} min={0} onChange={e => setPrecioQuincena(e.target.value)} />
                  </label>
                  <label>Mes
                    <input type="number" value={precioMes} min={0} onChange={e => setPrecioMes(e.target.value)} />
                  </label>
                </>
              )}
              <button type="button" onClick={handleAgregarTanda}>Agregar tanda + precios</button>
            </div>

            {/* Mostrar las tandas cargadas */}
            {tandasCarpas.length > 0 && (
              <div>
                <h4>Tandas agregadas</h4>
                <ul>
                  {tandasCarpas.map((t, idx) => (
                    <li key={idx}>
                      {tiposUbicacion.find(x => x.id_tipo_ubicaciones == t.id_tipo_ubicacion)?.nombre || "Tipo"}: {t.cantidadCarpas} carpas
                      <button type="button" style={{marginLeft:8}} onClick={() => handleEliminarTanda(t.id_tipo_ubicacion)}>Eliminar</button>
                      <div style={{fontSize:14, color:"#444", marginLeft:12}}>
                        Precios: Día ${preciosPorTipo.find(p=>p.id_tipo_ubicacion==t.id_tipo_ubicacion)?.dia || "-"} | Semana ${preciosPorTipo.find(p=>p.id_tipo_ubicacion==t.id_tipo_ubicacion)?.semana || "-"} | Quincena ${preciosPorTipo.find(p=>p.id_tipo_ubicacion==t.id_tipo_ubicacion)?.quincena || "-"} | Mes ${preciosPorTipo.find(p=>p.id_tipo_ubicacion==t.id_tipo_ubicacion)?.mes || "-"}
                      </div>
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