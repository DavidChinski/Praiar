import Header from '../components/Header/'
import Footer from '../components/Footer/'
import Ciudades from '../components/Ciudades/'
import React from "react";
import BusquedaHome from '../components/BusquedaHome';

function Home() {
  return (
    <>
      <Header />
      <BusquedaHome/>
      <Ciudades />
      <Footer />
    </>
  )
}

export default Home