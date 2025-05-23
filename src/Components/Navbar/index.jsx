import './Navbar.css'
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../../assets/LogoPraiarSinNombre.png';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/">
          <div className="logo-container">
            <img src={Logo} alt="Logo Praiar" className="logo" />
            <span className="brand">Praiar</span>
          </div>
        </Link>

        <button className="hamburger" onClick={toggleMenu}>☰</button>

        <div className={`menu ${menuOpen ? 'open' : ''}`}>
          <nav className="nav">
            <Link to="/ciudades">Ciudades</Link>
            <Link to="/beneficios">Beneficios</Link>
            <Link to="/contactos">Contáctanos</Link>
          </nav>

          <div className="auth-buttons">
            <button className="login">
              <Link to="/login">Iniciar Sesión</Link>
            </button>
            <button className="registrar">
              <Link to="/registrar">Crear una cuenta</Link>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
