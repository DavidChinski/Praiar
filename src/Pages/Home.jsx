import Navbar from '../Components/Navbar/'
import Footer from '../Components/Footer/'
import React from "react";
import BusquedaHome from '../Components/BusquedaHome';
import CiudadesHome from '../Components/CiudadesHome/'


function Home() {
  return (
    <>
      <Navbar />
      <BusquedaHome/>
      <CiudadesHome />
      <Footer />
    </>
  );
}

export default Home;