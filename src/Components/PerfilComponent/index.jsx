import './PerfilComponent.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';


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
    if (userData) {
      setUsuario(userData);
      setFormData({
        nombre: userData.nombre || '',
        apellido: userData.apellido || '',
        email: userData.email || '',
        dni: userData.dni || '',
        telefono: userData.telefono || '',
      });
    } else {
      navigate('/login');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!usuario || !usuario.id_usuario) {
      alert("No se encontró el ID del usuario.");
      return;
    }

    const { error } = await supabase
      .from('usuarios')
      .update({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        dni: parseInt(formData.dni),
        telefono: parseInt(formData.telefono),
      })
      .eq('auth_id', usuario.auth_id)


    if (error) {
      console.error('Error actualizando usuario:', error.message, error.details);
      alert(`Error al guardar cambios: ${error.message}`);
      return;
    }

    const updatedUser = { ...usuario, ...formData };
    setUsuario(updatedUser);
    localStorage.setItem('usuario', JSON.stringify(updatedUser));
    setShowEditModal(false);
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
            <div className="modal-botones">
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