// src/Pages/Home.jsx
import Layout from '../Layout/';
import BusquedaHome from '../Components/BusquedaHome';
import Ciudades from '../Components/Ciudades';
import ElegirPraiarHome from '../Components/ElegirPraiarHome/';
import OpcionBalneariosHome from '../Components/OpcionBalneariosHome/';
import { useEffect, useState } from 'react';

function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      setUser(JSON.parse(usuario));
    }
  }, []);

  return (
    <Layout>
      {user && (
        <div className="bienvenida-usuario">
          <h2>¡Bienvenido, {user.nombre || 'Usuario'}!</h2>
        </div>
      )}
      <BusquedaHome />
      <ElegirPraiarHome /> 
      <OpcionBalneariosHome />
      <Ciudades />
    </Layout>
  );
}

export default Home;
