import './PerfilComponent.css';
import { useEffect, useMemo, useState } from 'react';
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
      // Optimistic set to avoid flicker and unnecessary redirects on transient errors
      setUsuario(userData);
      setFormData({
        nombre: userData.nombre || '',
        apellido: userData.apellido || '',
        email: userData.email || '',
        dni: userData.dni || '',
        telefono: userData.telefono || '',
      });

      fetch(`http://localhost:3000/api/perfil/${userData.auth_id}`)
        .then(async (res) => {
          if (!res.ok) {
            // Si no está autorizado o hay error del servidor, mantenemos los datos locales
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (!data || !data.usuario) return;
          setUsuario(data.usuario);
          setFormData({
            nombre: data.usuario.nombre || '',
            apellido: data.usuario.apellido || '',
            email: data.usuario.email || '',
            dni: data.usuario.dni || '',
            telefono: data.usuario.telefono || '',
          });
        })
        .catch(() => {
          // No redirigimos si hay fallo de red; permanecemos en Perfil con datos locales
        });
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
    window.dispatchEvent(new Event('authChanged'));
    navigate('/');
  } catch (error) {
    console.error('Error inesperado en logout:', error);
    alert('Error al cerrar sesión.');
  }
};


  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const avatarFallback = useMemo(() => {
    const nombre = formData.nombre || '';
    const apellido = formData.apellido || '';
    const iniciales = `${nombre?.[0] || ''}${apellido?.[0] || ''}`.toUpperCase();
    return iniciales || 'U';
  }, [formData.nombre, formData.apellido]);

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
      window.dispatchEvent(new Event('authChanged'));
      setShowEditModal(false);
    } catch (error) {
      alert('Error de conexión con el servidor.');
    }
  };

  if (!usuario) return null;

  return (
    <div className="perfil-wrapper">
      <div className="perfil-banner" />
      <div className="perfil-header modern">
        <div className="avatar-wrapper">
          {usuario.imagen ? (
            <img src={usuario.imagen} alt="Foto de perfil" className="perfil-avatar" />
          ) : (
            <div className="perfil-avatar perfil-avatar-fallback">{avatarFallback}</div>
          )}
        </div>
        <div className="perfil-info">
          <div className="perfil-title-row">
            <h2 className="perfil-nombre">{usuario.nombre} {usuario.apellido}</h2>
            <span className={`badge ${usuario.esPropietario ? 'owner' : 'guest'}`}>
              {usuario.esPropietario ? 'Propietario' : 'Cliente'}
            </span>
          </div>
          <div className="perfil-chips">
            {usuario.email ? <span className="chip">{usuario.email}</span> : null}
            {usuario.telefono ? <span className="chip">{usuario.telefono}</span> : null}
            {usuario.dni ? <span className="chip">DNI {usuario.dni}</span> : null}
          </div>
          <div className="perfil-botones">
            <button className="btn-editar" onClick={handleEditProfile}>Editar perfil</button>
            <button className="btn-logout" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>
      </div>

      <div className="perfil-grid">
        <section className="perfil-card">
          <h3>Información de la cuenta</h3>
          <div className="info-list">
            <div className="info-row"><span>Nombre</span><strong>{usuario.nombre}</strong></div>
            <div className="info-row"><span>Apellido</span><strong>{usuario.apellido}</strong></div>
            <div className="info-row"><span>Email</span><strong>{usuario.email || '-'}</strong></div>
            <div className="info-row"><span>Teléfono</span><strong>{usuario.telefono || '-'}</strong></div>
            <div className="info-row"><span>DNI</span><strong>{usuario.dni || '-'}</strong></div>
            <div className="info-row"><span>Rol</span><strong>{usuario.esPropietario ? 'Propietario' : 'Cliente'}</strong></div>
          </div>
        </section>

        <section className="perfil-card">
          <h3>Accesos rápidos</h3>
          <div className="acciones-rapidas">
            {usuario.esPropietario ? (
              <>
                <a className="quick-link" href="/tusbalnearios">Tus balnearios</a>
                <a className="quick-link" href="/ciudades">Explorar balnearios</a>
              </>
            ) : (
              <>
                <a className="quick-link" href="/tusreservas/null">Tus reservas</a>
                <a className="quick-link" href="/ciudades">Explorar balnearios</a>
              </>
            )}
          </div>
        </section>
      </div>

      {showEditModal && (
        <div className="modal-overlay-perfil">
          <div className="modal-perfil">
            <h3>Editar Perfil</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
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
            </form>
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