import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient.js';
import './BusquedaHome.css';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import BalneariosBusquedaHome from '../../assets/BalneariosBusquedaHome.png';
import LocalizacionBusquedaHome from '../../assets/LocalizacionBusquedaHome.png';
import FechaBusquedaHome from '../../assets/FechaBusquedaHome.png';
import BusquedaHomeSearch from '../../assets/BusquedaHome.png';
import VideoBanner from '../../assets/VideoBusqueda.mp4';
import { FaChevronDown } from 'react-icons/fa';

function BusquedaHome() {
  const [ciudades, setCiudades] = useState([]);
  const [balnearios, setBalnearios] = useState([]);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState(null);
  const [balnearioSeleccionado, setBalnearioSeleccionado] = useState(null);
  const [rangoFechas, setRangoFechas] = useState([
    { startDate: new Date(), endDate: new Date(), key: 'selection' }
  ]);
  const [showCalendario, setShowCalendario] = useState(false);
  const [usuario, setUsuario] = useState(null);

  // Autocompletado
  const [ciudadInput, setCiudadInput] = useState('');
  const [ciudadMatch, setCiudadMatch] = useState(null);

  const [balnearioInput, setBalnearioInput] = useState('');
  const [balnearioMatch, setBalnearioMatch] = useState(null);

  const inputRef = useRef(null);
  const balnearioInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioLS = localStorage.getItem("usuario");
    if (usuarioLS) setUsuario(JSON.parse(usuarioLS));
  }, []);

  useEffect(() => {
    async function fetchCiudades() {
      try {
        const res = await fetch('http://localhost:3000/api/ciudades');
        const data = await res.json();
        setCiudades(data);
      } catch (err) { console.error('Error al obtener ciudades:', err); }
    }
    fetchCiudades();
  }, []);

  // Coincidencia que SOLO EMPIEZA por el input, case-insensitive y sin acentos
  useEffect(() => {
    if (!ciudadInput) {
      setCiudadMatch(null);
      setCiudadSeleccionada(null);
      return;
    }
    const normalizar = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const inputNorm = normalizar(ciudadInput);
    const match = ciudades.find(c =>
      normalizar(c.nombre).startsWith(inputNorm)
    );
    setCiudadMatch(match || null);
    if (match && normalizar(match.nombre) === inputNorm) {
      setCiudadSeleccionada(match.id_ciudad);
    } else {
      setCiudadSeleccionada(null);
    }
    setBalnearioSeleccionado(null);
    setBalnearioInput('');
    setBalnearioMatch(null);
  }, [ciudadInput, ciudades]);

  useEffect(() => {
    async function fetchBalnearios() {
      if (!ciudadSeleccionada) {
        setBalnearios([]);
        return;
      }
      try {
        const res = await fetch(`http://localhost:3000/api/balnearios?ciudad_id=${ciudadSeleccionada}`);
        const data = await res.json();
        setBalnearios(data);
      } catch (err) {
        console.error('Error al obtener balnearios:', err);
        setBalnearios([]);
      }
    }
    fetchBalnearios();
  }, [ciudadSeleccionada]);

  // Autocompletado balneario
  useEffect(() => {
    if (!balnearioInput) {
      setBalnearioMatch(null);
      setBalnearioSeleccionado(null);
      return;
    }
    const normalizar = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const inputNorm = normalizar(balnearioInput);
    const match = balnearios.find(b =>
      normalizar(b.nombre).startsWith(inputNorm)
    );
    setBalnearioMatch(match || null);
    if (match && normalizar(match.nombre) === inputNorm) {
      setBalnearioSeleccionado(match.id_balneario);
    } else {
      setBalnearioSeleccionado(null);
    }
  }, [balnearioInput, balnearios]);

  // Overlay sólo si hay match que EMPIEZA por el input y no es igual
  function renderCiudadMatch() {
    const showOverlay =
      ciudadInput.length > 0 &&
      ciudadMatch &&
      ciudadInput !== ciudadMatch.nombre.slice(0, ciudadInput.length);

    return (
      <div className="input-autocomplete-wrapper">
        <input
          ref={inputRef}
          id="localidad"
          className="input-estandar"
          type="text"
          placeholder="Ingresar la localidad"
          value={ciudadInput}
          onChange={e => setCiudadInput(e.target.value)}
          autoComplete="off"
        />
        {showOverlay && (
          <div
            className="input-autocomplete-overlay"
            onMouseDown={e => {
              setCiudadInput(ciudadMatch.nombre);
              setCiudadSeleccionada(ciudadMatch.id_ciudad);
              setTimeout(() => inputRef.current && inputRef.current.blur(), 0);
            }}
          >
            <span style={{ opacity: 0 }}>{ciudadInput}</span>
            <span style={{ color: "#005A84", fontWeight: 500 }}>
              <span>{ciudadInput}</span>
              <span style={{ color: "#bbb" }}>
                {ciudadMatch.nombre.slice(ciudadInput.length)}
              </span>
            </span>
          </div>
        )}
      </div>
    );
  }

  function renderBalnearioMatch() {
    const showOverlay =
      balnearioInput.length > 0 &&
      balnearioMatch &&
      balnearioInput !== balnearioMatch.nombre.slice(0, balnearioInput.length);

    return (
      <div className="input-autocomplete-wrapper">
        <input
          ref={balnearioInputRef}
          id="balneario"
          className="input-estandar"
          type="text"
          placeholder="Ingresar el balneario"
          value={balnearioInput}
          onChange={e => setBalnearioInput(e.target.value)}
          autoComplete="off"
          disabled={!ciudadSeleccionada}
        />
        {showOverlay && (
          <div
            className="input-autocomplete-overlay"
            onMouseDown={e => {
              setBalnearioInput(balnearioMatch.nombre);
              setBalnearioSeleccionado(balnearioMatch.id_balneario);
              setTimeout(() => balnearioInputRef.current && balnearioInputRef.current.blur(), 0);
            }}
          >
            <span style={{ opacity: 0 }}>{balnearioInput}</span>
            <span style={{ color: "#005A84", fontWeight: 500 }}>
              <span>{balnearioInput}</span>
              <span style={{ color: "#bbb" }}>
                {balnearioMatch.nombre.slice(balnearioInput.length)}
              </span>
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="busqueda-home">
      <div className="hero">
        <video
          src={VideoBanner}
          autoPlay
          muted
          loop
          playsInline
          className="video-background"
        />
        <div className="hero-darken"></div>
        <div className="overlay">
          {usuario?.esPropietario ? (
            <div className='propietarioBusqueda'>
              <h1 className="titulo-busqueda" style={{marginBottom: 0, paddingBottom: 0}}>Praiar</h1>
              <h3 className="subtitulo-busqueda">Donde tu balneario crece</h3>
              <button className="flecha-abajo" onClick={() => {
                const target = document.getElementById('seccion-inferior');
                const offset = 60;
                if (target) {
                  const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }}>
                <FaChevronDown />
              </button>
            </div>
          ) : (
            <>
              <h1 className="titulo-busqueda">Encontrá tu próximo lugar en la playa</h1>
              <div className="busqueda-form">

                {/* Localidades */}
                <div className="input-group" style={{ position: "relative" }}>
                  <img src={LocalizacionBusquedaHome} className="icon" alt="Localización" />
                  <div className="input-wrapper">
                    <label htmlFor="localidad" className='subtitulo'>Localidades</label>
                    {renderCiudadMatch()}
                  </div>
                </div>

                {/* Balnearios */}
                <div className="input-group" style={{ position: "relative" }}>
                  <img src={BalneariosBusquedaHome} className="icon" alt="Balnearios" />
                  <div className="input-wrapper">
                    <label htmlFor="balneario" className='subtitulo'>Balnearios</label>
                    {renderBalnearioMatch()}
                  </div>
                </div>

                {/* Fecha con calendario */}
                <div className="input-group date-group">
                  <img
                    src={FechaBusquedaHome}
                    className="iconFecha"
                    alt="Fecha"
                    onClick={() => setShowCalendario(!showCalendario)}
                    style={{ cursor: 'pointer' }}
                  />
                  <div className="input-wrapper">
                    <label className='subtitulo'>Fecha</label>
                    <div className="date-summary input-estandar" onClick={() => setShowCalendario(!showCalendario)}>
                      {format(rangoFechas[0].startDate, 'dd/MM/yyyy')} - {format(rangoFechas[0].endDate, 'dd/MM/yyyy')}
                    </div>
                    {showCalendario && (
                      <div className="calendario-container" style={{ position: 'absolute', zIndex: 999, left: '-330px' }}>
                        <DateRange
                          editableDateInputs={true}
                          onChange={item => setRangoFechas([item.selection])}
                          moveRangeOnFirstSelection={false}
                          ranges={rangoFechas}
                          months={2}
                          direction="horizontal"
                          rangeColors={["#004080"]}
                          minDate={new Date()}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón buscar */}
                <button
                  className="search-button"
                  onClick={() => {
                    if (balnearioSeleccionado) {
                      navigate(`/balneario/${balnearioSeleccionado}`, {
                        state: {
                          fechaInicio: rangoFechas[0].startDate.toISOString(),
                          fechaFin: rangoFechas[0].endDate.toISOString()
                        }
                      });
                    }
                  }}
                  disabled={!balnearioSeleccionado}
                >
                  <img src={BusquedaHomeSearch} className="search-icon" alt="Buscar" />
                </button>

              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BusquedaHome;