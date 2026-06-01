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
        <em>Smart plans for the body you scan.</em>
      </p>
    </footer>
  );
}

export default Footer;
