import Header from '../components/Header/'
import Footer from '../components/Footer/'
import React from "react";
import CiudadesTodas from '../components/CiudadesTodas/'
function CiudadesPag() {
  return (
    <>
      <Header />
      <h1>Todas las ciudades Costeras</h1>
       <CiudadesTodas/>
      <Footer />
    </>
  )
}

export default CiudadesPag