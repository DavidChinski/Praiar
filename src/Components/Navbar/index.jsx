import './Navbar.css';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Logo from '../../assets/LogoPraiarSinNombre.png';
import PerfilNab from '../../assets/PerfilNab.png';

import { supabase } from '../../supabaseClient';

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
          <Link to="/perfil"><img src={PerfilNab} alt="" style={{position:'relative', width: '40px', height: 'auto', objectFit: 'contain'}}/></Link>
        </button>
        <button className="registrar" onClick={handleLogout} style={{ color: 'black', fontWeight: 'normal' }}>
          Cerrar sesión
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
    await supabase.auth.signOut();  
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

          <nav className="nav">
            <NavLinks usuario={usuario} />
          </nav>

          <div className="auth-buttons">
            <AuthButtons usuario={usuario} handleLogout={handleLogout} />
          </div>

          <button className="hamburger" onClick={toggleMenu}>☰</button>
        </div>
        {/* Menú móvil solo se renderiza si isMobile */}
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
