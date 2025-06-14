import './PerfilComponent.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function PerfilComponent() {
  const [usuario, setUsuario] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    dni: '',
    telefono: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('usuario'));
    if (userData && userData.auth_id) {
      fetch(`http://localhost:3000/api/perfil/${userData.auth_id}`)
        .then(res => res.json())
        .then(data => {
          setUsuario(data.usuario);
          setFormData({
            nombre: data.usuario.nombre || '',
            apellido: data.usuario.apellido || '',
            email: data.usuario.email || '',
            dni: data.usuario.dni || '',
            telefono: data.usuario.telefono || '',
          });
        })
        .catch(() => navigate('/login'));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: localStorage.getItem('supabase.auth.token'), // opcional, si estás guardando token
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error al cerrar sesión:', error);
    }

    localStorage.removeItem('usuario');
    // Opcional: eliminá el token de Supabase si lo estás usando
    // localStorage.removeItem('supabase.auth.token');

    navigate('/');
    window.location.reload(); // Forzá recarga si querés reiniciar estado global
  } catch (error) {
    console.error('Error inesperado en logout:', error);
    alert('Error al cerrar sesión.');
  }
};


  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!usuario || !usuario.auth_id) {
      alert("No se encontró el ID del usuario.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/perfil/${usuario.auth_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(`Error al guardar cambios: ${data.error}`);
        return;
      }

      setUsuario(data.usuario);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      setShowEditModal(false);
    } catch (error) {
      alert('Error de conexión con el servidor.');
    }
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

      {showEditModal && (
        <div className="modal-overlay-perfil">
          <div className="modal-perfil">
            <h3>Editar Perfil</h3>
            <label>
              Nombre:
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} />
            </label>
            <label>
              Apellido:
              <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} />
            </label>
            <label>
              Email:
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </label>
            <label>
              DNI:
              <input type="text" name="dni" value={formData.dni} onChange={handleChange} />
            </label>
            <label>
              Teléfono:
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
            </label>
            <div className="modal-perfil-botones">
              <button className="btn-guardar" onClick={handleSave}>Guardar</button>
              <button className="btn-cancelar" onClick={() => setShowEditModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerfilComponent;