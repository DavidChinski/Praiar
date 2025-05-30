import './QuienesSomos.css';
import LinkedinTrasparente from "../../assets/LinkedinTrasparente.webp";

function QuienesSomos() {
  return (
    <div className="quienes-somos-container">
      <h1>Quienes somos</h1>
      <div className="miembros">
        <div className="miembro">
          <div alt="Icono Lucas" className="icono" id="benezra"/>
          <p className="nombre">Lucas<br/>Benezra</p>
          <img src={LinkedinTrasparente} alt="LinkedIn Lucas" className="linkedin" />
        </div>

        <div className="miembro">
        <div alt="Icono Elias" className="icono" id="brodsky"/>
          <p className="nombre">Elias<br/>Brodsky</p>
          <img src={LinkedinTrasparente} alt="LinkedIn Elias" className="linkedin" />
        </div>

        <div className="miembro">
          <div alt="Icono David" className="icono" id="chinski"/>
          <p className="nombre">David<br/>Chinski</p>
          <img src={LinkedinTrasparente} alt="LinkedIn David" className="linkedin" />
        </div>
      </div>
    </div>
  );
}

export default QuienesSomos;
