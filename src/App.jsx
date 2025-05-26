import './App.css'
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Ciudades from "./Pages/Ciudades";
import Contactanos from "./Pages/Contactanos";

function App() {
  return (
    <Router>
      <div class="layout">
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/ciudades" element={<Ciudades />} /> 
          <Route path="/nosotros" element={<Contactanos />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
