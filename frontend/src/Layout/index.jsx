// src/Layout/Layout.jsx
import React from 'react';
import Navbar from '../Components/Navbar/';
import Footer from '../Components/Footer/';
import './Layout.css';

function Layout({ children }) {
  return (
    <div className="layout-container">
      <Navbar />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;


