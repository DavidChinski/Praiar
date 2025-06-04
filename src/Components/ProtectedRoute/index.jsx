// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient"; // Asegurate de tenerlo configurado

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };
    getSession();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return session ? children : <Navigate to="/login" />;
}
