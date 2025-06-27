// src/Layout/Layout.jsx
import React from 'react';
import Navbar from '../Components/Navbar/';
import Footer from '../Components/Footer/';
import './Layout.css';
import { Outlet } from 'react-router-dom';

function Layout({ children }) {
  return (
    <div className="layout-container">
      <Navbar />
      <main className="main-content"><Outlet/></main>
      <Footer />
    </div>
  );
}

export default Layout;


