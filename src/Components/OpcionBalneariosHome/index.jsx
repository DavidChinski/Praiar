import React from "react";
import { Link } from "react-router-dom";
import './OpcionBalneariosHome.css';
import imagenBalnearioHome from '../../assets/imagenBalnearioHome.png';

function OpcionBalneariosHome() {
  return (
    <div className="opcion-container">
      <h1 className="titulo">Opción para balnearios</h1>
      <div className="contenido">
        <img src={imagenBalnearioHome} alt="Gestión Balnearios" className="imagen" />
        <div className="linea-vertical"></div>
        <div className="texto">
          <p>
            <strong>Praiar</strong> es el lugar donde tu balneario <strong>importa</strong>.
            Gestiónalo de una manera fácil, rápida y única en un solo lugar.{" "}
            <Link to="/registrar" className="link-registrar">Registrate ahora</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default OpcionBalneariosHome;


