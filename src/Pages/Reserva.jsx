import Layout from '../Layout/'
import React from "react";
import ReservaComponent from '../components/ReservaComponent/'

function Reserva() {
  return (
      <Layout >
        <div id="seccion-inferior">
        {/* contenido que viene después */}
          <ReservaComponent />
        </div>
      </Layout>
  );
}

export default Reserva;
