import Layout from '../Layout/';
import QuienesSomos from '../Components/QuienesSomos';
import ComoContactarnos from '../Components/ComoContactarnos';
import BanerContactos from '../Components/BanerContactos';
function Contactanos() {
  return (
    <Layout>
      <BanerContactos />
      <div id="seccion-inferior">
        {/* contenido que viene después */}
        <QuienesSomos />
        <ComoContactarnos />
      </div>

      
    </Layout>
  );
}

export default Contactanos;
