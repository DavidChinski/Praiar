// src/Pages/Home.jsx

import BusquedaHome from '../Components/BusquedaHome';
import Ciudades from '../Components/Ciudades';
import ElegirPraiarHome from '../Components/ElegirPraiarHome/';
import OpcionBalneariosHome from '../Components/OpcionBalneariosHome/';
import { useEffect, useState } from 'react';
import FormularioConsultas from '../Components/FormularioConsultas/';

function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      setUser(JSON.parse(usuario));
    }
  }, []);

  return (
    <>
      <BusquedaHome />
      <div id="seccion-inferior">
        <ElegirPraiarHome /> 
        <OpcionBalneariosHome />

        {/* Aquí condicionamos qué componente mostrar */}
        {user && user.esPropietario ? (
          <FormularioConsultas />
        ) : (
          <Ciudades />
        )}
      </div>
    </>
  );
}

export default Home;
