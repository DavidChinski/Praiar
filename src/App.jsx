import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Contactos from "./pages/Contactos";
import Beneficios from "./pages/Beneficios";
import Descuentos from "./pages/Descuentos";
import LoginPage from "./pages/LoginPage";
import RegistrarPage from "./pages/RegistrarPage";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/contactos" element={<Contactos />} /> 
          <Route path="/beneficios" element={<Beneficios />} /> 
          <Route path="/descuentos" element={<Descuentos />} /> 
          <Route path="/login" element={<LoginPage />} /> 
          <Route path="/registrar" element={<RegistrarPage />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
