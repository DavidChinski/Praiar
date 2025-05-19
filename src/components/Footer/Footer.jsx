import Logo from "../../img/Logo Praiar.png";
import "./Footer.css";

function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="footer__container">
          <div className="footer__section logo">
            <img
              src="<!-- TODO: insert logo URL -->"
              alt="Praiar logo"
              className="footer__logo"
            />
            <p className="footer__slogan">
              Empezá el verano <br /> <strong>realmente Praiando</strong>
            </p>
          </div>

          <div className="footer__section links">
            <div>
              <h4>Enlaces</h4>
              <ul>
                <li>
                  <a href="#">Inicio</a>
                </li>
                <li>
                  <a href="#">Reservar</a>
                </li>
                <li>
                  <a href="#">Balnearios</a>
                </li>
                <li>
                  <a href="#">Beneficios</a>
                </li>
                <li>
                  <a href="#">Contacto</a>
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
