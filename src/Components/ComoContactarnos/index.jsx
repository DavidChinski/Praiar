import './ComoContactarnos.css';
import IlustracionContactos from "../../assets/IlustracionContactos.png"
import InstaContactos from "../../assets/InstaContactos.png"
import TwitterContactos from "../../assets/TwitterContactos.png"
import LinkedinContactos from "../../assets/LinkedinContactos.png"
function ComoContactarnos() {
  return (
    <div className="contacto-container">
      <h1>Cómo contactarnos</h1>
      <div className="contacto-content">
        <img src={IlustracionContactos} alt="Ilustración contacto" className="contacto-ilustracion" />

        <div className="contacto-separador"></div>

        <div className="contacto-redes">
          <img src={TwitterContactos} alt="X" className="icono-red" />
          <img src={InstaContactos} alt="Instagram" className="icono-red" />
          <img src={LinkedinContactos} alt="LinkedIn" className="icono-red" />
        </div>
      </div>
    </div>
  );
}

export default ComoContactarnos;
