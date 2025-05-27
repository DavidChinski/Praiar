import Layout from '../Layout/'
import React from "react";
import BalneariosComponent from '../components/BalneariosComponent/'
import BanerTusBalnearios from '../components/BanerTusBalnearios/'
import CrearBalneario from '../Components/CrearBalneario';
function TusBalnearios() {
  return (
      <Layout >
        <BanerTusBalnearios />
        <div id="seccion-inferior">
        {/* contenido que viene después */}
          <BalneariosComponent />
          <CrearBalneario />
        </div>
        
      </Layout>
  );
}

export default TusBalnearios;
