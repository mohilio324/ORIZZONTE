import { useNavigate } from 'react-router-dom';
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <img src="/images/logo.svg" alt="Moving Company Logo" />
      </div>
      <nav className="nav">
        <ul className="nav-list">
          <li className="nav-item">
            <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="nav-link">Home</a>
          </li>
          <li className="nav-item">
            <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="nav-link">Services</a>
          </li>
          <li className="nav-item">
            <a href="#order" onClick={(e) => scrollToSection(e, 'order')} className="nav-link">Order</a>
          </li>
          <li className="nav-item">
            <a href="#tracking" onClick={(e) => scrollToSection(e, 'tracking')} className="nav-link">Tracking</a>
          </li>
          <li className="nav-item">
            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="nav-link">About</a>
          </li>
          <li className="nav-item">
            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="nav-link">Contact</a>
          </li>
        </ul>
      </nav>
      <button className="login-btn" onClick={() => navigate('/SignIn')}>Login</button>
    </header>
  );
}
