import './ElegirPraiarHome.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function ElegirPraiarHome() {
  return (
    <div className="why-praiar">
      <h2>¿Por qué elegir Praiar?</h2>
      <div className="features">
        <div className="feature">
          <div className="ElegirPraiarIcon">
            <FontAwesomeIcon icon="fa-regular fa-clock" />
          </div>
          <p>
            Ahorrá tiempo<br />
            con una reserva<br />
            rápida y segura
          </p>
        </div>
        <div className="feature">
          <div className="ElegirPraiarIcon">
            <FontAwesomeIcon icon="fa-solid fa-tent" />
          </div>
          <p>
            Elegí tu carpa<br />
            o sombrilla favorita<br />
            para <i><strong>Praiar</strong></i> en la playa
          </p>
        </div>
        <div className="feature">
          <div className="ElegirPraiarIcon">
            <FontAwesomeIcon icon="fa-solid fa-bell-concierge" />
          </div>
          <p>
            Pedí tus<br />
            servicios del balneario<br />
            sin moverte
          </p>
        </div>
      </div>
    </div>
  );
}

export default ElegirPraiarHome;