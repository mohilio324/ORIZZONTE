import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const isLoggedin = localStorage.getItem("isLoggedin"); // this was store back in login.jsx to know wheter there is a user logged in or no

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAuthClick = async () => {
    if (isLoggedin === "true") {
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const accessToken = localStorage.getItem("access_token");

        // logout endpoint li kanet f backend w hada howa body ta3ha
        await axios.post(
          "http://127.0.0.1:8000/api/logout/",
          { refresh: refreshToken },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log("Logout successful");
      } catch (err) {
        console.error("Logout error:", err.response?.data || err.message);
      } finally {
        // dir refrech ui and clear the previuous storage
        localStorage.clear();
        window.location.reload();
      }
    } else {
      navigate('/SignIn');
    }
  };

  return (
    <header className="header">
      <div className="logo">
        <img src='images/logo.svg' alt="Moving Company Logo" />
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
      
      <button 
        className={isLoggedin === "true" ? "login-btn" : "login-btn"} 
        onClick={handleAuthClick}
      >
        
        {// this will help change content of the button
        isLoggedin === "true" ? "Logout" : "Login"}
      </button>
    </header>
  );
}