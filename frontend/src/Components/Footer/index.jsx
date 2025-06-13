import './Footer.css';
import Logo from "../../assets/LogoPraiar.png";
import TwitterFooter from "../../assets/TwitterFooter.png";
import InstaFooter from "../../assets/InstaFooter.png";
import LinkedinFooter from "../../assets/LinkedinFooter.png";
import GanchoFooter from "../../assets/GanchoFooter.png";
import TelefonoFooter from "../../assets/TelefonoFooter.png";
import MailFooter from "../../assets/MailFooter.png";
import { Link } from 'react-router-dom'; 
const linkedinPraiar = "https://www.linkedin.com/company/praiararg";

function Footer() {
  return (
    <footer>
      <div className="footer_main">
        <div className="logo_section">
          <Link to="/"><img src={Logo} alt="LogoPraiarFooter" className="logo_footer" /></Link>
          <p className="slogan_footer">
            Empezá el verano realmente <span>Praiando</span>
          </p>
        </div>

        <div className="enlaces_section">
          <h4>Enlaces</h4>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/ciudades">Ciudades</Link></li>
            <li><Link to="/beneficios">Beneficios</Link></li>
            <li><Link to="/nosotros">Contactos</Link></li>
          </ul>
        </div>

        <div className="balnearios_section">
          <h4>Para Balnearios</h4>
          <ul>
            <li><Link to="/comofunciona">¿Cómo funciona?</Link></li>
            <li><Link to="/estadisticas">Estadísticas</Link></li>
            <li><Link to="/tusbalnearios">Suma tu balneario</Link></li>
            <li><Link to="/login">Iniciar sesión</Link></li>
          </ul>
        </div>

        <div className="contacto_section">
          <h4>Contacto</h4>
          <ul>
            <li><img src={GanchoFooter} className="iconFooter"/> ORT Argentina, CABA</li>
            <li><img src={MailFooter} className="iconFooter"/> contacto@praiar.com</li>
            <li><img src={TelefonoFooter} className="iconFooter"/> +54 911 0000-0000</li>
            <li className="social_icons">
              <img src={TwitterFooter} alt="Twitter" />
              <img src={InstaFooter} alt="Instagram" />
              <a href={linkedinPraiar} target="_blank" rel="noopener noreferrer"><img src={LinkedinFooter} alt="LinkedIn" /></a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer_bottom">
        <p>© 2025 Praiar. Todos los derechos reservados.</p>
        <p><a href="#">Términos</a> | <a href="#">Privacidad</a></p>
      </div>
    </footer>
  );
}

export default Footer;
