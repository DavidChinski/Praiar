import { useEffect, useState } from 'react';
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

function BusquedaHome() {
  const [ciudades, setCiudades] = useState([]);
  const [balnearios, setBalnearios] = useState([]);
  const [ciudadSeleccionada, setCiudadSeleccionada] = useState(null);
  const [balnearioSeleccionado, setBalnearioSeleccionado] = useState(null);
  const [rangoFechas, setRangoFechas] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [showCalendario, setShowCalendario] = useState(false);

  const navigate = useNavigate();

  function handleCiudadChange(event) {
    const idCiudad = event.target.value;
    setCiudadSeleccionada(idCiudad !== '' ? parseInt(idCiudad) : null);
    setBalnearioSeleccionado(null); // Reinicia el balneario si cambia la ciudad
  }

  useEffect(() => {
  async function fetchCiudades() {
    try {
      const res = await fetch('http://localhost:3000/api/ciudades');
      const data = await res.json();
      setCiudades(data);
    } catch (err) {
      console.error('Error al obtener ciudades:', err);
    }
  }

  fetchCiudades();
}, []);

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
          <h1 className="titulo-busqueda">Encontrá tu próximo lugar en la playa</h1>
          <div className="busqueda-form">

            {/* Localidades */}
            <div className="input-group">
              <img src={LocalizacionBusquedaHome} className="icon" alt="Localización" />
              <div className="input-wrapper">
                <label htmlFor="localidad" className='subtitulo'>Localidades</label>
                <select
                  id="localidad"
                  className="input-estandar"
                  onChange={handleCiudadChange}
                  value={ciudadSeleccionada || ''}
                >
                  <option value="" disabled hidden>Ingresar la localidad</option>
                  {ciudades.map((ciudad) => (
                    <option key={ciudad.id_ciudad} value={ciudad.id_ciudad}>
                      {ciudad.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Balnearios */}
            <div className="input-group">
              <img src={BalneariosBusquedaHome} className="icon" alt="Balnearios" />
              <div className="input-wrapper">
                <label htmlFor="balneario" className='subtitulo'>Balnearios</label>
                <select
                  id="balneario"
                  className="input-estandar"
                  disabled={!ciudadSeleccionada}
                  onChange={(e) => setBalnearioSeleccionado(e.target.value)}
                  value={balnearioSeleccionado || ''}
                >
                  <option value="" hidden>Ingresar el balneario</option>
                  {balnearios.map((balneario) => (
                    <option key={balneario.id_balneario} value={balneario.id_balneario}>
                      {balneario.nombre}
                    </option>
                  ))}
                </select>
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
        </div>
      </div>
    </div>
  );
}

export default BusquedaHome;
