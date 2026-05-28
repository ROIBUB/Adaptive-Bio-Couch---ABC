import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './Layout.css';

// Layout wraps every protected page with the shared Navbar and Footer.
// Usage:
//   <Layout>
//     <DashboardPage />
//   </Layout>
//
// The page component passed as children fills the space between Navbar and Footer.
// The Login page does NOT use Layout — it has its own full-screen design.
function Layout({ children }) {
  return (
    <div className="layout-wrapper">
      <Navbar />
      <main className="layout-main">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;