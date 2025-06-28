import './ComoContactarnos.css';
import IlustracionContactos from "../../assets/IlustracionContactos.png"
import XContactos from "../../assets/XLogo.png";
import InstagramContactos from "../../assets/InstagramLogo.webp";
import LinkedinContactos from "../../assets/LinkedinLogo.png";
const linkedinPraiar = "https://www.linkedin.com/company/praiararg";
const instagramPraiar = "https://www.instagram.com/matibebe__/";
const XPraiar = "https://x.com/momorelojero";


function ComoContactarnos() {
  return (
    <div className="contacto-container">
      <h1>Cómo contactarnos</h1>
      <div className="contacto-content">
        <img src={IlustracionContactos} alt="Ilustración contacto" className="contacto-ilustracion" />

        <div className="contacto-separador"></div>

        <div className="contacto-redes">
          <a href={XPraiar} target="_blank" rel="noopener noreferrer">
            <img src={XContactos} alt="X" className="icono-red" />
          </a>
          <a href={instagramPraiar} target="_blank" rel="noopener noreferrer">
            <img src={InstagramContactos} alt="Instagram" className="icono-red" />
          </a>
          <a href={linkedinPraiar} target="_blank" rel="noopener noreferrer">
            <img src={LinkedinContactos} alt="LinkedIn" className="icono-red" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default ComoContactarnos;
