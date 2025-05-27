import './App.css'
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Ciudades from "./Pages/Ciudades";
import Contactanos from "./Pages/Contactanos";
import Login from "./Pages/Login";
import TusBalnearios from "./Pages/TusBalnearios";
import TusReservas from "./Pages/TusReservas";
function App() {
  return (
    <Router>
      <div class="layout">
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/ciudades" element={<Ciudades />} /> 
          <Route path="/nosotros" element={<Contactanos />} /> 
          <Route path="/login" element={<Login />} /> 
          <Route path="/tusbalnearios" element={<TusBalnearios />} /> 
          <Route path="/tusreservas" element={<TusReservas />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
