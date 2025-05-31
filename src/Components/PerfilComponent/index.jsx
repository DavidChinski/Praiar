import './PerfilComponent.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PerfilComponent() {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('usuario'));
    if (userData) {
      setUsuario(userData);
    } else {
      // Si no hay sesión, redirige al login
      navigate('/login');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/');
  };

  if (!usuario) return null; // o un loading...

  return (
    <div className="perfil-container">
      <h2>Mi Perfil</h2>
      <div className="perfil-datos">
        <p><strong>Nombre:</strong> {usuario.nombre}</p>
        <p><strong>Apellido:</strong> {usuario.apellido}</p>
        <p><strong>Email:</strong> {usuario.email}</p>
        <p><strong>DNI:</strong> {usuario.dni}</p>
        <p><strong>Teléfono:</strong> {usuario.telefono}</p>
        <p><strong>Propietario:</strong> {usuario.esPropietario ? 'Sí' : 'No'}</p>
      </div>
      <button className="btn-logout" onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}

export default PerfilComponent;
