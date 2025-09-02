import { useEffect, useState } from "react";
import "./CrearBalneario.css";

function CrearBalneario() {
  // Balneario info
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState("");
  const [ciudades, setCiudades] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // Tanda actual
  const [tipoUbicacion, setTipoUbicacion] = useState("");
  const [cantidadCarpas, setCantidadCarpas] = useState(""); // Cambiado a string para poder dejar vacío
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

  // Imágenes seleccionadas
  const [imagenes, setImagenes] = useState([]);

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
    if (!cantidadCarpas || parseInt(cantidadCarpas) <= 0) return setMensaje("Debe ingresar la cantidad de carpas.");
    if (precioDia === "" || precioSemana === "" || precioQuincena === "" || precioMes === "") {
      return setMensaje("Debe ingresar todos los precios para este tipo.");
    }
    // Evitar duplicados de tipo
    if (tandasCarpas.some(t => t.id_tipo_ubicacion === tipoUbicacion)) {
      return setMensaje("Ya has agregado una tanda de este tipo.");
    }

    setTandasCarpas([...tandasCarpas, {
      id_tipo_ubicacion: tipoUbicacion,
      cantidadCarpas: parseInt(cantidadCarpas),
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
    setCantidadCarpas(""); // Ahora vacío
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

  // Manejar selección de imágenes
  const handleImagenesChange = (e) => {
    setImagenes(Array.from(e.target.files));
  };

  // Subir imágenes al backend (las guarda en bucket y las registra en BD)
  const subirImagenesABackend = async (balnearioId) => {
    if (imagenes.length === 0) return { urls: [] };
    const formData = new FormData();
    formData.append("id_balneario", balnearioId);
    imagenes.forEach((img) => {
      formData.append("imagenes", img, img.webkitRelativePath || img.name);
    });
    const res = await fetch("http://localhost:3000/api/crear-imagenes-balneario", {
      method: "POST",
      body: formData
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Error al subir imágenes.");
    return result;
  };

  // Enviar todo al backend
  const handleFinalizar = async (e) => {
    e.preventDefault();
    setMensaje("");
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario || !usuario.auth_id) return setMensaje("Sesión no válida.");
    if (!ciudadSeleccionada) return setMensaje("Debe seleccionar una ciudad.");
    if (tandasCarpas.length === 0) return setMensaje("Debe agregar al menos una tanda de carpas.");
    if (tandasCarpas.some(tc => !preciosPorTipo.find(pt => pt.id_tipo_ubicacion === tc.id_tipo_ubicacion))) {
      return setMensaje("Debe ingresar los precios de todos los tipos agregados.");
    }
    if (preciosPorTipo.some(
      p => p.dia === "" || p.semana === "" || p.quincena === "" || p.mes === ""
    )) {
      return setMensaje("Debe ingresar todos los precios de cada tipo.");
    }

    const body = {
      nombre,
      direccion,
      telefono,
      ciudadSeleccionada,
      idUsuario: usuario.auth_id,
      tandasCarpas,
      precios: preciosPorTipo,
      imagen: null  // Imagen principal se actualiza luego
    };

    try {
      // 1. Crear el balneario (sin imágenes)
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
      const balnearioId = result.id_balneario;

      // 2. Subir imágenes si hay
      if (imagenes.length > 0) {
        const { urls } = await subirImagenesABackend(balnearioId);

        // 3. Actualizar imagen principal del balneario (la primera imagen)
        if (urls && urls.length > 0) {
          await fetch("http://localhost:3000/api/actualizar-imagen-principal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_balneario: balnearioId, imagen: urls[0] })
          });
        }
      }

      window.location.href = "/tusbalnearios";
    } catch (err) {
      setMensaje("Error al guardar. Intente nuevamente.");
    }
  };

  return (
    <div className="crear-balneario-container">
      <div className="crear-balneario-layout">
        <div className="crear-balneario-header">
          <h1 className="crear-balneario-title">Crear Nuevo Balneario</h1>
          <p className="crear-balneario-subtitle">Complete la información para registrar su establecimiento</p>
        </div>

        <form onSubmit={handleFinalizar} className="crear-balneario-form">
          {/* Información del Balneario */}
          <div className="form-section-card">
            <div className="section-header">
              <div className="section-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Información del Balneario</h3>
              <p>Datos básicos del establecimiento</p>
            </div>
            {/* Distribuir en dos columnas horizontalmente */}
            <div className="form-row-horizontal">
              <div className="form-group">
                <label htmlFor="nombre">Nombre del Balneario *</label>
                <input 
                  id="nombre" 
                  type="text" 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)} 
                  required 
                  placeholder="Ingrese el nombre del balneario"
                />
              </div>
              <div className="form-group">
                <label htmlFor="direccion">Dirección *</label>
                <input 
                  id="direccion" 
                  type="text" 
                  value={direccion} 
                  onChange={(e) => setDireccion(e.target.value)} 
                  required 
                  placeholder="Ingrese la dirección completa"
                />
              </div>
              <div className="form-group">
                <label htmlFor="telefono">Teléfono *</label>
                <input 
                  id="telefono" 
                  type="tel" 
                  value={telefono} 
                  onChange={(e) => setTelefono(e.target.value)} 
                  required 
                  placeholder="Ingrese el número de teléfono"
                />
              </div>
              <div className="form-group">
                <label htmlFor="ciudad">Ciudad *</label>
                <select 
                  style={{maxWidth: '295.33px'}}
                  id="ciudad" 
                  value={ciudadSeleccionada} 
                  onChange={(e) => setCiudadSeleccionada(e.target.value)} 
                  required
                >
                  <option value="">Seleccione una ciudad</option>
                  {ciudades.map((ciudad) => (
                    <option key={ciudad.id_ciudad} value={ciudad.id_ciudad}>{ciudad.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group full-width">
                <label htmlFor="imagenes">Imágenes del Balneario *</label>
                <input 
                  id="imagenes"
                  type="file"
                  multiple
                  webkitdirectory="true"
                  directory="true"
                  onChange={handleImagenesChange}
                  accept="image/*"
                />
                <p>Puedes subir una carpeta con varias imágenes.</p>
                {imagenes.length > 0 &&
                  <ul>
                    {imagenes.map((img, idx) => (
                      <li key={idx}>{img.webkitRelativePath || img.name}</li>
                    ))}
                  </ul>
                }
              </div>
            </div>
          </div>

          {/* Configuración de Carpas */}
          <div className="form-section-card">
            <div className="section-header">
              <div className="section-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 7L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 11L20 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 15L20 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 19L20 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Configuración de Carpas</h3>
              <p>Defina los tipos y cantidades de ubicaciones disponibles</p>
            </div>
            {/* Distribución horizontal */}
            <div className="form-row-horizontal">
              <div className="form-group">
                <label htmlFor="tipoUbicacion">Tipo de Ubicación *</label>
                <select 
                  style={{maxWidth: '295.33px'}}
                  id="tipoUbicacion" 
                  value={tipoUbicacion} 
                  onChange={(e) => setTipoUbicacion(e.target.value)}
                >
                  <option value="">Seleccione tipo</option>
                  {tiposUbicacion
                    .filter(tipo => !tandasCarpas.some(tc => tc.id_tipo_ubicacion == tipo.id_tipo_ubicaciones))
                    .map(tipo => (
                      <option key={tipo.id_tipo_ubicaciones} value={tipo.id_tipo_ubicaciones}>{tipo.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="cantidadCarpas">Cantidad de Carpas *</label>
                <input 
                  id="cantidadCarpas" 
                  type="number" 
                  value={cantidadCarpas}
                  onChange={e => setCantidadCarpas(e.target.value)} // Permite vacío
                  min="1"
                  placeholder="Ingrese cantidad"
                />
              </div>
              <div className="form-group">
                <label htmlFor="sillas">Cantidad de Sillas</label>
                <input 
                  id="sillas" 
                  type="number" 
                  value={cantSillas} 
                  onChange={e => setCantSillas(parseInt(e.target.value) || 0)} 
                  min="0"
                  placeholder="2"
                />
              </div>
              <div className="form-group">
                <label htmlFor="mesas">Cantidad de Mesas</label>
                <input 
                  id="mesas" 
                  type="number" 
                  value={cantMesas} 
                  onChange={e => setCantMesas(parseInt(e.target.value) || 0)} 
                  min="0"
                  placeholder="1"
                />
              </div>
              <div className="form-group">
                <label htmlFor="reposeras">Cantidad de Reposeras</label>
                <input 
                  id="reposeras" 
                  type="number" 
                  value={cantReposeras} 
                  onChange={e => setCantReposeras(parseInt(e.target.value) || 0)} 
                  min="0"
                  placeholder="2"
                />
              </div>
              <div className="form-group">
                <label htmlFor="capacidad">Capacidad por Carpa</label>
                <input 
                  id="capacidad" 
                  type="number" 
                  value={capacidad} 
                  onChange={e => setCapacidad(parseInt(e.target.value) || 0)} 
                  min="1"
                  placeholder="4"
                />
              </div>
            </div>

            {/* Precios */}
            {tipoUbicacion && (
              <div className="precios-section">
                <div className="precios-header">
                  <h4>Precios para {tiposUbicacion.find(t => t.id_tipo_ubicaciones == tipoUbicacion)?.nombre || ""}</h4>
                  <p>Configure los precios para diferentes períodos</p>
                </div>
                <div className="form-row-horizontal precios-horizontal">
                  <div className="form-group">
                    <label htmlFor="precioDia">Precio por Día *</label>
                    <div className="input-with-prefix">
                      <span className="currency-prefix">$</span>
                      <input 
                        id="precioDia"
                        type="number" 
                        value={precioDia} 
                        min="0" 
                        onChange={e => setPrecioDia(e.target.value)} 
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="precioSemana">Precio por Semana *</label>
                    <div className="input-with-prefix">
                      <span className="currency-prefix">$</span>
                      <input 
                        id="precioSemana"
                        type="number" 
                        value={precioSemana} 
                        min="0" 
                        onChange={e => setPrecioSemana(e.target.value)} 
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="precioQuincena">Precio por Quincena *</label>
                    <div className="input-with-prefix">
                      <span className="currency-prefix">$</span>
                      <input 
                        id="precioQuincena"
                        type="number" 
                        value={precioQuincena} 
                        min="0" 
                        onChange={e => setPrecioQuincena(e.target.value)} 
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="precioMes">Precio por Mes *</label>
                    <div className="input-with-prefix">
                      <span className="currency-prefix">$</span>
                      <input 
                        id="precioMes"
                        type="number" 
                        value={precioMes} 
                        min="0" 
                        onChange={e => setPrecioMes(e.target.value)} 
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                </div>
                <button type="button" onClick={handleAgregarTanda} className="add-tanda-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Agregar Tanda y Precios
                </button>
              </div>
            )}
          </div>

          {/* Tandas Agregadas */}
          {tandasCarpas.length > 0 && (
            <div className="form-section-card">
              <div className="section-header">
                <div className="section-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <h3>Tandas Configuradas</h3>
                <p>Resumen de las ubicaciones agregadas</p>
              </div>
              <div className="tandas-grid">
                {tandasCarpas.map((t, idx) => (
                  <div key={idx} className="tanda-card">
                    <div className="tanda-header">
                      <h4>{tiposUbicacion.find(x => x.id_tipo_ubicaciones == t.id_tipo_ubicacion)?.nombre || "Tipo"}</h4>
                      <button 
                        type="button" 
                        onClick={() => handleEliminarTanda(t.id_tipo_ubicacion)}
                        className="remove-tanda-btn"
                        title="Eliminar tanda"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    <div className="tanda-details">
                      <div className="detail-item">
                        <span className="detail-label">Carpas:</span>
                        <span className="detail-value">{t.cantidadCarpas}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Sillas:</span>
                        <span className="detail-value">{t.cantSillas}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Mesas:</span>
                        <span className="detail-value">{t.cantMesas}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Reposeras:</span>
                        <span className="detail-value">{t.cantReposeras}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Capacidad:</span>
                        <span className="detail-value">{t.capacidad} personas</span>
                      </div>
                    </div>
                    <div className="tanda-precios">
                      <h5>Precios</h5>
                      <div className="precios-list">
                        <div className="precio-item">
                          <span className="precio-label">Día:</span>
                          <span className="precio-value">${preciosPorTipo.find(p=>p.id_tipo_ubicacion==t.id_tipo_ubicacion)?.dia || "-"}</span>
                        </div>
                        <div className="precio-item">
                          <span className="precio-label">Semana:</span>
                          <span className="precio-value">${preciosPorTipo.find(p=>p.id_tipo_ubicacion==t.id_tipo_ubicacion)?.semana || "-"}</span>
                        </div>
                        <div className="precio-item">
                          <span className="precio-label">Quincena:</span>
                          <span className="precio-value">${preciosPorTipo.find(p=>p.id_tipo_ubicacion==t.id_tipo_ubicacion)?.quincena || "-"}</span>
                        </div>
                        <div className="precio-item">
                          <span className="precio-label">Mes:</span>
                          <span className="precio-value">${preciosPorTipo.find(p=>p.id_tipo_ubicacion==t.id_tipo_ubicacion)?.mes || "-"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            {mensaje && (
              <div className="mensaje-container">
                <div className="mensaje-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                  </svg>
                </div>
                <p className="mensaje-text">{mensaje}</p>
              </div>
            )}

            {/* Botón Finalizar */}
            <div className="form-actions">
              <button className="submit-btn" type="submit">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Crear Balneario
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CrearBalneario;