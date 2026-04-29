import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderContext } from '../src/context/OrderContext.jsx';
import './OrderSummary.css';
// hello

export default function OrderSummary() {
  const navigate = useNavigate();
  const { updateOrderData } = useOrderContext();
  const [helpersCount, setHelpersCount] = useState(0);
  const [confirmationMethod, setConfirmationMethod] = useState('');
  const [cargoDetails, setCargoDetails] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const incrementHelpers = () => setHelpersCount(prev => prev + 1);
  const decrementHelpers = () => setHelpersCount(prev => (prev > 0 ? prev - 1 : 0));

  const handleSendOrder = () => {
    const cargoData = {
      commodity: cargoDetails,
      helpers: helpersCount.toString().padStart(2, '0'),
      phoneNumber: `+213${phoneNumber}`,
      confirmationMethod
    };
    updateOrderData(cargoData);
    console.log("Proceeding to Order Confirmation", cargoData);
    navigate('/order-confirmation');
  };

  return (
    <div className="order-summary-container">
      <header className="os-top-nav">
        <div style={{ width: '50px' }}></div> {/* Spacer for centering logo */}
        <img src="/images/logo.svg" alt="Orizzonte" className="os-logo" />
        <button className="os-cancel-link" onClick={() => navigate("/")}>cancel</button>
      </header>

      <div className="os-back-wrapper">
        <button className="os-back-btn" onClick={() => navigate('/time')}>
          <img src="/images/ARROW.svg" alt="" /> <span>New order</span>
        </button>
      </div>

      <main className="os-main-content">
        {/* Section 1: Cargo Details */}
        <section className="os-section">
          <div className="os-section-header">
            <div className="os-icon-wrapper orange-bg">
              <span style={{color: 'white', fontSize: '18px', lineHeight: '1'}}>📦</span>
            </div>
            <h2>Cargo details</h2>
          </div>
          <textarea 
            className="os-textarea" 
            placeholder="Add a description of your cargo details . . . ."
            value={cargoDetails}
            onChange={(e) => setCargoDetails(e.target.value)}
          ></textarea>
        </section>

        {/* Section 2: Loading Helpers */}
        <section className="os-section">
          <div className="os-section-header">
            <div className="os-icon-wrapper orange-bg">
              <span style={{color: 'white', fontSize: '18px', lineHeight: '1'}}>👷</span>
            </div>
            <div className="os-header-text">
              <h2>Loading helpers</h2>
              <p className="os-subtext">Do you need Helpers ?</p>
            </div>
          </div>
          <div className="os-counter-wrapper">
            <button className="os-counter-btn" onClick={decrementHelpers}>
              <span className="os-counter-icon">-</span>
            </button>
            <input 
              type="text" 
              className="os-counter-input" 
              value={helpersCount} 
              readOnly 
            />
            <button className="os-counter-btn" onClick={incrementHelpers}>
              <span className="os-counter-icon">+</span>
            </button>
          </div>
        </section>

        <hr className="os-divider" />

        {/* Section 3: Your Informations */}
        <section className="os-section">
          <div className="os-section-header">
            <div className="os-icon-wrapper orange-bg">
              <span style={{color: 'white', fontSize: '18px', lineHeight: '1'}}>🆔</span>
            </div>
            <h2>Your Informations</h2>
          </div>

          <div className="os-info-grid">
            <div className="os-phone-group">
              <label className="os-phone-label">
                <span className="os-phone-icon">📞</span> Enter your phone number
              </label>
              <div className="os-phone-input-wrapper">
                <span className="os-phone-prefix">+213</span>
                <input 
                  type="text" 
                  className="os-phone-input" 
                  placeholder="X X X X X X X X X"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            <div className="os-confirmation-group">
              <div className="os-confirmation-label">
                <span className="os-mail-icon">📩</span> How would you like to receive the confirmation message ?
              </div>
              <div className="os-cards-wrapper">
                <div 
                  className={`os-confirm-card ${confirmationMethod === 'SMS' ? 'selected' : ''}`}
                  onClick={() => setConfirmationMethod('SMS')}
                >
                  <div className="os-card-title">
                    <span className="os-card-icon">💬</span> SMS
                  </div>
                  <p className="os-card-desc">A confirmation SMS will be sent to the provided phone number.</p>
                </div>
                
                <div 
                  className={`os-confirm-card ${confirmationMethod === 'WhatsApp' ? 'selected' : ''}`}
                  onClick={() => setConfirmationMethod('WhatsApp')}
                >
                  <div className="os-card-title">
                    <span className="os-card-icon whatsapp-icon">🟢</span> WhatsApp
                  </div>
                  <p className="os-card-desc">A confirmation text will be sent to the provided phone number.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section 4: Action Button */}
          <div className="os-action-wrapper">
            <button className="os-send-btn" onClick={handleSendOrder}>
              Send Order <span style={{marginLeft: '8px', fontSize: '1.2em'}}>✈️</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
