import React from "react";
import BalneariosComponent from '../components/BalneariosComponent/'
import CrearBalneario from '../Components/CrearBalneario';
function TusBalnearios() {
  return (
      < >
  
        <div id="seccion-inferior">
        {/* contenido que viene después */}
          <BalneariosComponent />
          <CrearBalneario />
        </div>
        
      </>
  );
}

export default TusBalnearios;
