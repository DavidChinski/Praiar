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
function App() {
  return (
    <Router>
      <div className="layout">
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/ciudades" element={<Ciudades />} /> 
          <Route path="/nosotros" element={<Contactanos />} /> 
          <Route path="/login" element={<Login />} /> 
          <Route path="/perfil" element={<Perfil />} /> 
          <Route path="/registrar" element={<Registrar />} /> 
          <Route path="/tusbalnearios" element={<TusBalnearios />} /> 
          <Route path="/tusreservas" element={<TusReservas />} /> 
          <Route path="/balneario/:id" element={<VistaBalneario />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
