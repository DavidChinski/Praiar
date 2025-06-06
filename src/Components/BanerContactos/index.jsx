import './BanerContactos.css';
import BannerImage from '../../assets/ImagenBusquedaHome.png';
import { FaChevronDown } from 'react-icons/fa';
import VideoBanner from '../../assets/VideoBusqueda.mp4';

function BanerContactos() {
  const scrollToSection = () => {
    const target = document.getElementById('seccion-inferior');
    const offset = 80; // Espacio superior para que no lo tape el header
    if (target) {
      const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="hero-container">
      <video
        src={VideoBanner}
        autoPlay
        muted
        loop
        playsInline
        className="video-background"
      />
      <div className="hero-darken"></div>
      <div className="overlay">
        <h1 className="hero-titulo-banner">Praiar</h1>
        <h3 className="hero-subtitle">Más que una simple página de reservas</h3>
        <button className="flecha-abajo" onClick={scrollToSection}>
          <FaChevronDown />
        </button>
      </div>
    </div>
  );
}

export default BanerContactos;
