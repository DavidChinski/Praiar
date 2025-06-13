// src/Layout/Layout.jsx
import React from 'react';
import Navbar from '../Components/Navbar/';
import Footer from '../Components/Footer/';

function Layout({ children }) {
  return (
    <>
      <Navbar />
        <main>{children}</main>
      <Footer />
    </>
  );
}

export default Layout;


