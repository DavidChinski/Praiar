import { useEffect, useState } from 'react';
import Layout from '../Layout/';
import QuienesSomos from '../Components/QuienesSomos';
import ComoContactarnos from '../Components/ComoContactarnos';
import BanerContactos from '../Components/BanerContactos';
import FormularioConsultas from '../Components/FormularioConsultas/';

function Contactanos() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
      setUser(JSON.parse(usuario));
    }
  }, []);

  return (
    <Layout>
      <BanerContactos />
      <div id="seccion-inferior">
        {/* contenido que viene después */}
        <QuienesSomos />
        <ComoContactarnos />
        {user && user.esPropietario ? (
          <FormularioConsultas />
        ) : null}
      </div>
    </Layout>
  );
}

export default Contactanos;
