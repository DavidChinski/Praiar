import './App.css'
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Ciudades from "./Pages/Ciudades";
import Contactanos from "./Pages/Contactanos";
import Login from "./Pages/Login";
import Registrar from "./Pages/Registrar";
import Perfil from "./Pages/Perfil";
import TusBalnearios from "./Pages/TusBalnearios";
import TusReservas from "./Pages/TusReservas";
import VistaBalneario from "./Pages/VistaBalneario";
import Reserva from "./Pages/Reserva";
import ProtectedRoute from "./Components/ProtectedRoute"; // nuevo import
import BalneariosPorCiudad from "./Components/BalneariosPorCiudad";
import InformacionExtra from './Pages/informacion-extra'
import AuthCallback from './Pages/AuthCallback';
import Error from "./Pages/Error";
import Layout from './Layout';
function App() {
  return (
    <Router>
      <div className="layout">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />}/>
            <Route path="/ciudades" element={<Ciudades />} /> 
            <Route path="/nosotros" element={<Contactanos />} /> 
            <Route path="/login" element={<Login />} /> 
            <Route path="/registrar" element={<Registrar />} /> 
            <Route path="/ciudades/:idCiudad/balnearios" element={<BalneariosPorCiudad />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/informacion-extra" element={<InformacionExtra />} />
            <Route path="*" element={<Error />} />

            {/* Rutas protegidas */}
            <Route path="/perfil" element={
              <ProtectedRoute><Perfil /></ProtectedRoute>
            } />
            <Route path="/tusbalnearios" element={
              <ProtectedRoute><TusBalnearios /></ProtectedRoute>
            } />
            <Route path="/tusreservas/:id" element={
              <ProtectedRoute><TusReservas /></ProtectedRoute>
            } />
            <Route path="/balneario/:id" element={
              <ProtectedRoute><VistaBalneario /></ProtectedRoute>
            } />
            <Route path="/reservaubicacion/:id" element={
              <ProtectedRoute><Reserva /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
