import './QuienesSomos.css';
import LinkedinTrasparente from "../../assets/LinkedinTrasparente.webp";
const linkedinBenezra = "https://www.linkedin.com/in/lucas-benezra/";
const linkedinBrodsky = "https://www.linkedin.com/in/elias-brodsky-ba6b26315/";
const linkedinChinski = "https://www.linkedin.com/in/david-chinski-a16a88297/";

function QuienesSomos() {
  return (
    <div className="quienes-somos-container">
      <h1>Quienes somos</h1>
      <div className="miembros">
        <div className="miembro">
          <div alt="Icono Lucas" className="icono" id="benezra"/>
          <p className="nombre">Lucas<br/>Benezra</p>
          <a
            href={linkedinBenezra}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={LinkedinTrasparente}
              alt="LinkedIn Lucas"
              className="linkedin"
            />
          </a>
        </div>

        <div className="miembro">
          <div alt="Icono Elias" className="icono" id="brodsky"/>
          <p className="nombre">Elias<br/>Brodsky</p>
          <a
            href={linkedinBrodsky}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={LinkedinTrasparente}
              alt="LinkedIn Elias"
              className="linkedin"
            />
          </a>
        </div>

        <div className="miembro">
          <div alt="Icono David" className="icono" id="chinski"/>
          <p className="nombre">David<br/>Chinski</p>
          <a
            href={linkedinChinski}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={LinkedinTrasparente}
              alt="LinkedIn David"
              className="linkedin"
            />
          </a>
        </div>
      </div>
    </div>
  );
}

export default QuienesSomos;
