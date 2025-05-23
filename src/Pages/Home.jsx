import Navbar from '../Components/Navbar/'
import Footer from '../Components/Footer/'
import React from "react";
import BusquedaHome from '../Components/BusquedaHome';

function Home() {
  return (
    <>
      <Navbar />
      <BusquedaHome/>
      <Footer />
    </>
  );
}

export default Home;