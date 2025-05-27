import './Navbar.css';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Logo from '../../assets/LogoPraiarSinNombre.png';

function Navbar() {
  const location = useLocation();
  const isCiudades = location.pathname === '/ciudades';
  const [menuOpen, setMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setUsuario(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <Link to="/" className='logo-link'>
            <div className="logo-container">
              <img src={Logo} alt="Logo Praiar" className="logo" />
              <span className="brand">Praiar</span>
            </div>
          </Link>

          <button className="hamburger" onClick={toggleMenu}>☰</button>

          <div className={`menu ${menuOpen ? 'open' : ''}`}>
            <nav className="nav">
              {!usuario && (
                <>
                  <Link to="/ciudades">Ciudades</Link>
                  <Link to="/beneficios">Beneficios</Link>
                  <Link to="/nosotros">Contáctanos</Link>
                </>
              )}

              {usuario && usuario.esPropietario && (
                <>
                  <Link to="/tusbalnearios">Tus Balnearios</Link>
                  <Link to="/nosotros">Contactos</Link>
                </>
              )}

              {usuario && !usuario.esPropietario && (
                <>
                  <Link to="/tusreservas">Tus Reservas</Link>
                  <Link to="/ciudades">Ciudades</Link>
                  <Link to="/nosotros">Contactos</Link>
                </>
              )}
            </nav>

            <div className="auth-buttons">
              {usuario ? (
                <>
                  <button className="login">
                    <Link to="/perfil">Mi Cuenta</Link>
                  </button>
                  <button className="registrar" onClick={handleLogout} style={{ color: 'black', fontWeight: 'normal' }}>
                    Cerrar sesión
                  </button>
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
          </div>
        </div>
      </header>

      <div className={`header-spacer ${isCiudades ? 'spacer-ciudades' : 'spacer-general'}`} />
    </>
  );
}

export default Navbar;
