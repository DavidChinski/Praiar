import Header from '../components/Header/'
import Footer from '../components/Footer/'
import React from "react";
import Ciudades from '../components/Ciudades/'
function Descuentos() {
  return (
    <>
      <Header />
      <h1>Todas las ciudades Costeras</h1>
       <Ciudades/>
      <Footer />
    </>
  )
}

export default Descuentos