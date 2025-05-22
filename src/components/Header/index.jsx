import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Logo from '../../img/LogoPraiarSinNombre.png';
import './Header.css';

function Header() {
  const [cliente, setCliente] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const session = localStorage.getItem('cliente');
    if (session) {
      setCliente(JSON.parse(session));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cliente');
    setCliente(null);
    navigate('/');
    window.location.reload(); 
  };

  return (
    <header className="header">
      <Link to="/">
        <div className="logo-container">
          <img src={Logo} alt="Logo Praiar" className="logo" />
          <span className="brand">Praiar</span>
        </div>
      </Link>

      <nav className="nav">
        <Link to="/ciudades">Ciudades</Link>
        <Link to="/beneficios">Beneficios</Link>
        <Link to="/contactos">Contáctanos</Link>
      </nav>

      <div className="auth-buttons">
        {cliente ? (
          <>
            <span className="welcome">Hola, {cliente.nombre || cliente.mail}!</span>
            <button className="logout" onClick={handleLogout}>Cerrar sesión</button>
          </>
        ) : (
          <>
            <button className="login">
              <Link to="/login">Iniciar Sesión</Link>
            </button>
            <button className="registrar">
              <Link to="/registrar">Crear una cuenta</Link>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;