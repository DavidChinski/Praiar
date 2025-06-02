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
      navigate('/login');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const handleEditProfile = () => {
    navigate('/editar-perfil');
  };

  if (!usuario) return null;

  return (
    <div className="perfil-wrapper">
      <div className="perfil-header">
        <img
          src={usuario.imagen}
          alt="Foto de perfil"
          className="perfil-avatar"
        />
        <div className="perfil-info">
          <h2 className="perfil-nombre">{usuario.nombre} {usuario.apellido}</h2>
          <div className="perfil-botones">
            <button className="btn-editar" onClick={handleEditProfile}>Editar perfil</button>
            <button className="btn-logout" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>
      </div>
      <div className="perfil-datos">
        <p><strong>Email:</strong> {usuario.email}</p>
        <p><strong>DNI:</strong> {usuario.dni}</p>
        <p><strong>Teléfono:</strong> {usuario.telefono}</p>
        <p><strong>Propietario:</strong> {usuario.esPropietario ? 'Sí' : 'No'}</p>
      </div>
    </div>
  );
}

export default PerfilComponent;
