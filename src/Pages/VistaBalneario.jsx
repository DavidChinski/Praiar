import CarpasDelBalneario from "../components/CarpasDelBalneario";
import Layout from '../Layout/'

function VistaBalneario() {
  return (
    <Layout>
      <h1>Detalle del Balneario</h1>
      {/* Acá podés mostrar otros detalles del balneario */}
      <CarpasDelBalneario />
    </Layout>
  );
}

export default VistaBalneario