import Header from '../components/Header/'
import Footer from '../components/Footer/'
import React from "react";
import BalneariosFiltroCiudad from '../components/BalneariosFiltroCiudad';
function CiudadesPag() {
  return (
    <>
      <Header />
      <h1>Balnearios</h1>
       <BalneariosFiltroCiudad/>
      <Footer />
    </>
  )
}

export default CiudadesPag