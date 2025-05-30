// src/Pages/Home.jsx
import Layout from '../Layout/';
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
    <Layout>
      <BusquedaHome />
      <ElegirPraiarHome /> 
      <OpcionBalneariosHome />

      {/* Aquí condicionamos qué componente mostrar */}
      {user && user.esPropietario ? (
        <FormularioConsultas />
      ) : (
        <Ciudades />
      )}
    </Layout>
  );
}

export default Home;
