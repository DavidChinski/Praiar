import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // Puedes mejorar este chequeo según lo que guardes en localStorage.
  // Si usuario es null o no tiene auth_id, no tiene sesión.
  if (!usuario || !usuario.auth_id) {
    return <Navigate to="/login" />;
  }

  return children;
}