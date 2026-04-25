import "./Hero.css";
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");
  const isLoggedin = localStorage.getItem("isLoggedin");
  return (
    <section id="home" className="hero">
      
      <img
        src="/images/homeimage.jpg"
        alt="Home"
        className="hero-bg"
      />
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-title">
          Moving your world with{" "}
          <span className="highlight">care and precision.</span>
        </h1>
        <p className="hero-description">
          Specialized in residential and corporate moving. We provide
          end-to-end solutions for your transport needs, ensuring safety at
          every mile.
        </p>
        <div className="hero-buttons">
          <button onClick={() => navigate('/NewOrder1')} className="btn-primary">BOOK NOW</button>
          <button className="btn-secondary" >
            <span className="play-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon>
              </svg>
            </span>
            View Process {userName} 
          </button>
        </div>
      </div>
    </section>
  );
}
