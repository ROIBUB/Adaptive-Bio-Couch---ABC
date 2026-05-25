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
        <em>Personalized fitness and nutrition coaching, built around your progress.</em>
      </p>
    </footer>
  );
}

export default Footer;
