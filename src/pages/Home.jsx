import Header from '../components/Header/Header'
import Footer from '../components/Footer/Footer'
import Ciudades from '../components/Ciudades/Ciudades'
import React, { useEffect, useState } from "react";
import BusquedaHome from '../components/BusquedaHome';

function Home() {
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    const sessionData = localStorage.getItem('cliente');
    if (sessionData) {
      setCliente(JSON.parse(sessionData));
    }
  }, []);

  return (
    <>
      <Header />
      <BusquedaHome/>
      <div style={{ padding: '2rem' }}>
        {cliente ? (
          <h2>Bienvenido, {cliente.nombre || cliente.mail} 👋</h2>
        ) : (
          <h2>Bienvenido a Praiar</h2>
        )}
      </div>
      <Ciudades />
      <Footer />
    </>
  );
}

export default Home;
