import './QuienesSomos.css';
import LinkedinTrasparente from "../../assets/LinkedinTrasparente.webp";
import EliasImagen from "../../assets/EliasImagen.jpg"

function QuienesSomos() {
  return (
    <div className="quienes-somos-container">
      <h1>Quienes somos</h1>
      <div className="miembros">
        <div className="miembro">
          <img src="/ruta/icono1.png" alt="Icono Lucas" className="icono" />
          <p className="nombre">Lucas<br/>Benezra</p>
          <img src={LinkedinTrasparente} alt="LinkedIn Lucas" className="linkedin" />
        </div>

        <div className="miembro">
          <img src={EliasImagen} alt="Icono Elias" className="icono" />
          <p className="nombre">Elias<br/>Brodsky</p>
          <img src={LinkedinTrasparente} alt="LinkedIn Elias" className="linkedin" />
        </div>

        <div className="miembro">
          <img src="/ruta/icono3.png" alt="Icono David" className="icono" />
          <p className="nombre">David<br/>Chinski</p>
          <img src={LinkedinTrasparente} alt="LinkedIn David" className="linkedin" />
        </div>
      </div>
    </div>
  );
}

export default QuienesSomos;
