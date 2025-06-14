import './Navbar.css';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Logo from '../../assets/LogoPraiarSinNombre.png';
import PerfilNab from '../../assets/PerfilNab.png';

function NavLinks({ usuario }) {
  if (!usuario) {
    return (
      <>
        <Link to="/ciudades">Ciudades</Link>
        <Link to="/beneficios">Beneficios</Link>
        <Link to="/nosotros">Contáctanos</Link>
      </>
    );
  }
  if (usuario.esPropietario) {
    return (
      <>
        <Link to="/tusbalnearios">Tus Balnearios</Link>
        <Link to="/nosotros">Contactos</Link>
      </>
    );
  }
  return (
    <>
      <Link to="/tusreservas/null">Tus Reservas</Link>
      <Link to="/ciudades">Ciudades</Link>
      <Link to="/nosotros">Contactos</Link>
    </>
  );
}

function AuthButtons({ usuario, handleLogout }) {
  if (usuario) {
    return (
      <>
        <button className="perfil-img">
          <Link to="/perfil">
            <img src={PerfilNab} alt="" className="img-logo-perfil" />
          </Link>
        </button>
      </>
    );
  }
  return (
    <>
      <button className="login">
        <Link to="/login">Iniciar Sesión</Link>
      </button>
      <button className="registrar">
        <Link to="/registrar">Crear una cuenta</Link>
      </button>
    </>
  );
}

function Navbar() {
  const location = useLocation();
  const isCiudades = location.pathname === '/ciudades';
  const [menuOpen, setMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1005);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      setUsuario(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1005);
      if (window.innerWidth > 1005 && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen]);

  const toggleMenu = () => {
    if (isMobile) {
      setMenuOpen((open) => !open);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: localStorage.getItem('supabase.auth.token') }) // opcional
      });

      if (response.ok) {
        localStorage.removeItem('usuario');
        setUsuario(null);
        navigate('/');
        window.location.reload();
      } else {
        const data = await response.json();
        alert('Error al cerrar sesión: ' + (data?.error || ''));
      }
    } catch (err) {
      console.error('Error en logout', err);
      alert('Error inesperado al cerrar sesión.');
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="logo-container">
            <Link to="/" className="logo-link">
              <img src={Logo} alt="Logo Praiar" className="logo" />
              <span className="brand">Praiar</span>
            </Link>
          </div>

          <nav className="nav">
            <NavLinks usuario={usuario} />
          </nav>

          <div className="auth-buttons">
            <AuthButtons usuario={usuario} handleLogout={handleLogout} />
          </div>

          <button className="hamburger" onClick={toggleMenu}>☰</button>
        </div>

        {isMobile && (
          <div className={`menu${menuOpen ? ' open' : ''}`}>
            <nav className="nav-mobile">
              <NavLinks usuario={usuario} />
            </nav>
            <div className="auth-buttons-mobile">
              <AuthButtons usuario={usuario} handleLogout={handleLogout} />
            </div>
          </div>
        )}
      </header>

      <div className={`header-spacer ${isCiudades ? 'spacer-ciudades' : 'spacer-general'}`} />
    </>
  );
}

export default Navbar;
