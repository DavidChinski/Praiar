import Navbar from '../Components/Navbar/';
import Footer from '../Components/Footer/';
import React from "react";
import BusquedaHome from '../Components/BusquedaHome';
import CiudadesHome from '../Components/CiudadesHome/';
import ElegirPraiarHome from '../Components/ElegirPraiarHome/';
import OpcionBalneariosHome from '../Components/OpcionBalneariosHome/';

function Home() {
  return (
    <>
      <Navbar />
      <BusquedaHome/>
      <ElegirPraiarHome /> 
      <OpcionBalneariosHome />
      <CiudadesHome />
      <Footer />
    </>
  );
}

export default Home;