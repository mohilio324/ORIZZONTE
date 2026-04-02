import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-top">
        <div className="banner-image-wrapper">
          <img
            src="/images/last picture.svg"
            alt="Movers carrying a sofa"
            className="main-banner-img"
          />
          <div className="ready-text-container">
            <div className="ready-text">Ready To</div>
          </div>
        </div>
      </div>

      <div className="yellow-bg-section">
        <div className="move-action-container">
          <div className="move-text">Move ?</div>
          <img
            src="/images/ready to move button.svg"
            alt="Ready to move arrow"
            className="action-arrow"
          />
        </div>

        <div className="footer-main">
          <div className="footer-col brand-col">
            <div className="brand-logo-container">
              <img src="/images/logo.svg" alt="Orizzonte Logo" className="footer-logo-img" />
              <span className="brand-title">ORIZZONTE</span>
            </div>
            <p className="brand-desc">
              Modern logistics solutions for a moving<br />
              world. Fast, reliable, and secure<br />
              transportation services globally.
            </p>
            <div className="social-links">
              <a href="#"><img src="/images/formkit_instagram.svg" alt="Instagram" /></a>
              <a href="#"><img src="/images/ic_baseline-facebook.svg" alt="Facebook" /></a>
              <a href="#"><img src="/images/mdi_linkedin.svg" alt="LinkedIn" /></a>
            </div>
          </div>

          <div className="footer-col support-col">
            <h4 className="col-title">Support</h4>
            <ul className="footer-nav">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Insurance Info</a></li>
            </ul>
          </div>

          <div className="footer-col contact-col">
            <h4 className="col-title">Contact Info</h4>
            <ul className="contact-list">
              <li>
                <img src="/images/localisation.svg" alt="Location" />
                <span>ALGERIA , BEJAIA , AMIZOUR</span>
              </li>
              <li>
                <img src="/images/phone number.svg" alt="Phone" />
                <span>+213664843195</span>
              </li>
              <li>
                <img src="/images/email.svg" alt="Email" />
                <span>Orizzonte@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="copyright">
            © {new Date().getFullYear()} ORIZZONTE Global Services Inc. All rights reserved.
          </div>
          <div className="legal-links">
            <a href="#">Sitemap</a>
            <a href="#">Security</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
