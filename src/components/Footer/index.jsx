import Logo from "../../img/Logo Praiar.png";
import { Link } from 'react-router-dom';
import "./Footer.css";

function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer__container">
          <Link to="/">
            <div className="footer__section logo">
              <img src={Logo} alt="Logo Praiar" className="logo" />
                <p className="footer__slogan">
                  Empezá el verano <br /> <strong>realmente Praiando</strong>
                </p>
            </div>
          </Link>
          <div className="footer__section links">
            <div>
              <h4>Enlaces</h4>
              <ul>
                <li>
                  <Link to="/">Inicio</Link>
                </li>
                <li>
                  <Link to="/">Reservar</Link>
                </li>
                <li>
                  <Link to="/">Balnearios</Link>
                </li>
                <li>
                  <Link to="/beneficios">Beneficios</Link>
                </li>
                <li>
                  <Link to="/contactos">Contactos</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4>Para Balnearios</h4>
              <ul>
                <li>
                  <a href="#">¿Cómo funciona?</a>
                </li>
                <li>
                  <a href="#">Sumá tu balneario</a>
                </li>
                <li>
                  <a href="#">Estadísticas</a>
                </li>
                <li>
                  <a href="#">Iniciar sesión</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer__section contact">
            <h4>Contacto</h4>
            <p>ORT Argentina, CABA</p>
            <p>
              <a href="mailto:contacto@praiar.com">contacto@praiar.com</a>
            </p>
            <p>+54 911 0000-0000</p>
            <div className="footer__social">
              <a href="#">
                <img src="<!-- TODO: insert mail icon URL -->" alt="Mail" />
              </a>
              <a href="#">
                <img
                  src="<!-- TODO: insert instagram icon URL -->"
                  alt="Instagram"
                />
              </a>
              <a href="#">
                <img
                  src="<!-- TODO: insert linkedin icon URL -->"
                  alt="LinkedIn"
                />
              </a>
            </div>
          </div>
        </div>
        <div className="footer__bottom">
          <p>&copy; 2025 Praiar | Términos | Privacidad</p>
        </div>
      </footer>
    </>
  );
}

export default Footer;
