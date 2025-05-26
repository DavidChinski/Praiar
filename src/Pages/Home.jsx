// src/Pages/Home.jsx
import Layout from '../Layout/';
import BusquedaHome from '../Components/BusquedaHome';
import Ciudades from '../Components/Ciudades';
import ElegirPraiarHome from '../Components/ElegirPraiarHome/';
import OpcionBalneariosHome from '../Components/OpcionBalneariosHome/';

function Home() {
  return (
    <Layout>
      <BusquedaHome />
      <ElegirPraiarHome /> 
      <OpcionBalneariosHome />
      <Ciudades />
    </Layout>
  );
}

export default Home;
