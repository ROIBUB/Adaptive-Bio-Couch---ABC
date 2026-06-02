import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <p>
        <strong>Adaptive Bio-Coach</strong>
        {' '}|{' '}
        {new Date().getFullYear()}
        {' '}|{' '}
        <em>Where AI Meets Fitness</em>
      </p>
    </footer>
  );
}

export default Footer;
