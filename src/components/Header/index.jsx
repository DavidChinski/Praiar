import { Link } from 'react-router-dom';
import Logo from '../../img/LogoPraiarSinNombre.png';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <Link to="/">
        <div className="logo-container">
          <img src={Logo} alt="Logo Praiar" className="logo" />
          <span className="brand">Praiar</span>
        </div>
      </Link>

      <nav className="nav">
        <Link to="/descuentos">Descuentos</Link>
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

      
    </header>
  );
}

export default Header;
