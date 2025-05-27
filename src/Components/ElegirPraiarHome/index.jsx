import './ElegirPraiarHome.css';
import ElegirPraiarTiempo from '../../assets/ElegirPraiarTiempo.png';
import ElegirPraiarCarpa from '../../assets/ElegirPraiarCarpa.png';
import ElegirPraiarReloj from '../../assets/ElegirPraiarReloj.png';

function ElegirPraiarHome() {
  return (
    <div className="why-praiar">
      <h2>¿Por qué elegir Praiar?</h2>
      <div className="features">
        <div className="feature">
          <img src={ElegirPraiarReloj} alt="Ícono de reloj" />
          <p>
            Ahorrá tiempo
            con una reserva
            rápida y segura
          </p>
        </div>
        <div className="feature">
          <img src={ElegirPraiarCarpa} alt="Ícono de carpa" />
          <p>
            Elegí tu carpa
            o sombrilla favorita<br />
            para <i><strong>Praiar</strong></i> en la playa
          </p>
        </div>
        <div className="feature">
          <img src={ElegirPraiarTiempo} alt="Ícono de bandeja" />
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
