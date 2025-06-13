import Layout from '../Layout/';
import QuienesSomos from '../Components/QuienesSomos';
import ComoContactarnos from '../Components/ComoContactarnos';
import BanerContactos from '../Components/BanerContactos';
import FormularioConsultas from '../Components/FormularioConsultas/';
function Contactanos() {
  return (
    <Layout>
      <BanerContactos />
      <div id="seccion-inferior">
        {/* contenido que viene después */}
        <QuienesSomos />
        <ComoContactarnos />
        <FormularioConsultas />
      </div>

      
    </Layout>
  );
}

export default Contactanos;
