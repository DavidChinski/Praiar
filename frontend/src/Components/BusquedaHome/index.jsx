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
  const [ciudadMatches, setCiudadMatches] = useState([]);

  const [balnearioInput, setBalnearioInput] = useState('');
  const [balnearioMatches, setBalnearioMatches] = useState([]);

  const inputRef = useRef(null);
  const balnearioInputRef = useRef(null);
  const ciudadDropdownRef = useRef(null);
  const balnearioDropdownRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (ciudadDropdownRef.current && !ciudadDropdownRef.current.contains(event.target)) {
        setCiudadMatches([]);
      }
      if (balnearioDropdownRef.current && !balnearioDropdownRef.current.contains(event.target)) {
        setBalnearioMatches([]);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setCiudadMatches([]);
      setCiudadSeleccionada(null);
      return;
    }
    const normalizar = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const inputNorm = normalizar(ciudadInput);
    const matches = ciudades.filter(c =>
      normalizar(c.nombre).startsWith(inputNorm)
    ).slice(0, 3); // Máximo 3 resultados
    
    setCiudadMatches(matches);
    
    // Verificar si hay coincidencia exacta
    const exactMatch = matches.find(c => normalizar(c.nombre) === inputNorm);
    if (exactMatch) {
      setCiudadSeleccionada(exactMatch.id_ciudad);
    } else {
      setCiudadSeleccionada(null);
    }
    setBalnearioSeleccionado(null);
    setBalnearioInput('');
    setBalnearioMatches([]);
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
      setBalnearioMatches([]);
      setBalnearioSeleccionado(null);
      return;
    }
    const normalizar = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const inputNorm = normalizar(balnearioInput);
    const matches = balnearios.filter(b =>
      normalizar(b.nombre).startsWith(inputNorm)
    ).slice(0, 3); // Máximo 3 resultados
    
    setBalnearioMatches(matches);
    
    // Verificar si hay coincidencia exacta
    const exactMatch = matches.find(b => normalizar(b.nombre) === inputNorm);
    if (exactMatch) {
      setBalnearioSeleccionado(exactMatch.id_balneario);
    } else {
      setBalnearioSeleccionado(null);
    }
  }, [balnearioInput, balnearios]);

  // Componente para mostrar múltiples sugerencias
  function renderCiudadMatch() {
    const showSuggestions = ciudadInput.length > 0 && ciudadMatches.length > 0;

    return (
      <div className="input-autocomplete-wrapper" ref={ciudadDropdownRef}>
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
        {showSuggestions && (
          <div className="autocomplete-dropdown">
            {ciudadMatches.map((ciudad, index) => (
              <div
                key={ciudad.id_ciudad}
                className="autocomplete-option"
                onMouseDown={e => {
                  e.preventDefault();
                  setCiudadInput(ciudad.nombre);
                  setCiudadSeleccionada(ciudad.id_ciudad);
                  setCiudadMatches([]);
                  setTimeout(() => inputRef.current && inputRef.current.blur(), 0);
                }}
              >
                <span className="suggestion-text">
                  <span className="typed-text">{ciudadInput}</span>
                  <span className="completion-text">
                    {ciudad.nombre.slice(ciudadInput.length)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderBalnearioMatch() {
    const showSuggestions = balnearioInput.length > 0 && balnearioMatches.length > 0;

    return (
      <div className="input-autocomplete-wrapper" ref={balnearioDropdownRef}>
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
        {showSuggestions && (
          <div className="autocomplete-dropdown">
            {balnearioMatches.map((balneario, index) => (
              <div
                key={balneario.id_balneario}
                className="autocomplete-option"
                onMouseDown={e => {
                  e.preventDefault();
                  setBalnearioInput(balneario.nombre);
                  setBalnearioSeleccionado(balneario.id_balneario);
                  setBalnearioMatches([]);
                  setTimeout(() => balnearioInputRef.current && balnearioInputRef.current.blur(), 0);
                }}
              >
                <span className="suggestion-text">
                  <span className="typed-text">{balnearioInput}</span>
                  <span className="completion-text">
                    {balneario.nombre.slice(balnearioInput.length)}
                  </span>
                </span>
              </div>
            ))}
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
                      console.log(rangoFechas[0].startDate.toISOString(), rangoFechas[0].endDate.toISOString())
                      navigate(`/balneario/${balnearioSeleccionado}`, {
                        state: {
                          fechaInicio: rangoFechas[0].startDate.toISOString().split('T')[0],
                          fechaFin: rangoFechas[0].endDate.toISOString().split('T')[0]
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