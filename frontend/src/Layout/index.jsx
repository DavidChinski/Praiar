// src/Layout/Layout.jsx
import React, { useState } from 'react';
import Navbar from '../Components/Navbar/';
import Footer from '../Components/Footer/';
import { Outlet } from 'react-router-dom';
import './Layout.css';
import Agente from '../Components/AgenteComponent'; // Ajustá el path si cambia

function Layout() {
  const [mostrarChat, setMostrarChat] = useState(false);

  return (
    <div className="layout-container">
      <Navbar />
      <main className="main-content"><Outlet/></main>
      <Footer />

      {/* Botón flotante de chat */}
      <button
        className="boton-flotante-chat"
        onClick={() => setMostrarChat(prev => !prev)}
      >
        💬
      </button>

      {/* Contenedor del chat que se muestra al presionar el botón */}
      {mostrarChat && (
        <div className="chat-flotante">
          <Agente />
        </div>
      )}
    </div>
  );
}

export default Layout;
