import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrderContext } from "../src/context/OrderContext.jsx";
import "./SendOrder.css";

function SendOrder() {
  const navigate = useNavigate();
  const { orderData, updateOrderData } = useOrderContext();

  const [quantity, setQuantity] = useState(0);
  const [contactMethod, setContactMethod] = useState(null);
  const [cargoDetails, setCargoDetails] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleDecrease = () => setQuantity((prev) => Math.max(0, prev - 1));
  const handleIncrease = () => setQuantity((prev) => prev + 1);

  const handleSendOrder = () => {
    // Algerian phone regex: 10 digits starting with 05, 06, or 07
    const phoneRegex = /^0[567]\d{8}$/;

    if (!phoneNumber || !contactMethod) {
      setErrorMsg("Please provide your phone number and select a confirmation method.");
      return;
    }

    if (!phoneRegex.test(phoneNumber)) {
      setErrorMsg("Invalid phone number. It must be 10 digits and start with 05, 06, or 07.");
      return;
    }

    updateOrderData({
      commodity: cargoDetails,
      helpers: quantity,
      phoneNumber,
      confirmationMethod: contactMethod
    });
    console.log("Final Order Data updated in context");
    // Here you would typically send finalOrder to an API
    navigate('/order-confirmation');
  };

  return (
    <main className="send-order-page">
      <div className="send-order-container">
        <div className="send-order-top-row">
          <div className="top-logo-area">
            <img src="/images/logo.svg" alt="Logo" />
          </div>
          <button className="send-order-cancel" type="button" onClick={() => navigate(-1)}>
            cancel
          </button>
        </div>

        <div className="send-order-header-row">
          <button className="send-order-back" type="button" onClick={() => navigate('/time')}>
            <img src="/images/ARROW.svg" alt="Back" />
            <span>New order</span>
          </button>
        </div>

        {/* Order Summary from previous step */}
        {(orderData.pickup || orderData.delivery) && (
          <div className="order-summary-bar">
            <div className="order-summary-item">
              <span className="summary-label">📍 Pickup</span>
              <span className="summary-value">{orderData.pickup || '—'}</span>
            </div>
            <div className="order-summary-item">
              <span className="summary-label">🏁 Delivery</span>
              <span className="summary-value">{orderData.delivery || '—'}</span>
            </div>
            {orderData.distance && (
              <div className="order-summary-item">
                <span className="summary-label">📏 Distance</span>
                <span className="summary-value">{orderData.distance} km</span>
              </div>
            )}
            <div className="order-summary-item">
              <span className="summary-label">🗓 Date</span>
              <span className="summary-value">{orderData.isNow ? 'Now' : orderData.manualDate || '—'}</span>
            </div>
            <div className="order-summary-item">
              <span className="summary-label">🕐 Time</span>
              <span className="summary-value">{orderData.manualTime || '—'}</span>
            </div>
          </div>
        )}

        <section className="form-panel">
          <div className="form-section">
            <div className="section-heading">
              <div className="section-icon-box">
                <img src="/images/cubes.svg" alt="Cargo details" />
              </div>
              <h2>Cargo details</h2>
            </div>
            <textarea
              className="cargo-textarea"
              placeholder="Add a description of your cargo details..."
              value={cargoDetails}
              onChange={(e) => setCargoDetails(e.target.value)}
            />
          </div>

          <div className="form-section">
            <div className="section-heading">
              <div className="section-icon-box">
                <img src="/images/2mans.svg" alt="Loading helpers" />
              </div>
              <div>
                <h2>Loading helpers</h2>
                <p className="section-subtitle">Do you need Helpers ?</p>
              </div>
            </div>
            <div className="counter-row">
              <button className="counter-button" type="button" onClick={handleDecrease}>
                <img src="/images/-.svg" alt="Decrease" />
              </button>
              <input
                className="counter-input"
                type="text"
                value={quantity}
                readOnly
                aria-label="Number of helpers"
              />
              <button className="counter-button" type="button" onClick={handleIncrease}>
                <img src="/images/+.svg" alt="Increase" />
              </button>
            </div>
          </div>

          <div className="form-section">
            <hr className="section-divider" />
            <div className="info-header">
              <div className="info-icon-box">
                <img src="/images/contact.svg" alt="Contact" />
              </div>
              <h2>Your Informations</h2>
            </div>
            <div className="info-subtext">
              <img src="/images/linephone.svg" alt="" />
              <p>Enter your phone namber</p>
            </div>

            <div className="info-row">
              <div className="phone-input-row">
                <span className="phone-prefix">+213</span>
                <input
                  className="phone-input"
                  type="tel"
                  placeholder="06 XX XX XX XX"
                  maxLength={10}
                  aria-label="Phone number"
                  value={phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 10) setPhoneNumber(val);
                  }}
                />
              </div>

              <div className="confirmation-wrapper">
                <div className="confirmation-label">
                  <img src="/images/3points.svg" alt="" className="confirmation-label-icon" />
                  <p>How would you like to receive the confirmation message?</p>
                </div>

                <div className="confirmation-methods">
                  <button
                    type="button"
                    className={`method-card ${contactMethod === "sms" ? "active" : ""}`}
                    onClick={() => setContactMethod("sms")}
                  >
                    <div className="method-card-top">
                      <div className="method-icon-box">
                        <img src="/images/memory_message-text.svg" alt="SMS" />
                      </div>
                      <h3>SMS</h3>
                    </div>
                    <p>A confirmation SMS will be sent to the provided phone number.</p>
                  </button>

                  <button
                    type="button"
                    className={`method-card ${contactMethod === "whatsapp" ? "active" : ""}`}
                    onClick={() => setContactMethod("whatsapp")}
                  >
                    <div className="method-card-top">
                      <div className="method-icon-box">
                        <img src="/images/logos_whatsapp-monochrome-icon.svg" alt="WhatsApp" />
                      </div>
                      <h3>WhatsApp</h3>
                    </div>
                    <p>A confirmation message will be sent through WhatsApp.</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="actions-row">
              <button className="send-order-button" type="button" onClick={handleSendOrder}>
                <span>Send Order</span>
                <img src="/images/send.svg" alt="Send" />
              </button>
            </div>
            <hr className="section-divider" />
          </div>
        </section>

        {/* ERROR MODAL */}
        {errorMsg && (
          <div style={{position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center"}}>
            <div style={{backgroundColor: "white", borderRadius: "25px", padding: "30px", width: "90%", maxWidth: "400px", boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)", textAlign: "center"}}>
              <div style={{fontSize: "40px", marginBottom: "10px"}}>⚠️</div>
              <h3 style={{color: "#FF5E5E", marginBottom: "15px", fontSize: "24px", fontWeight: "800", fontFamily: "'Inter', sans-serif"}}>Missing Information</h3>
              <p style={{marginBottom: "25px", fontWeight: "600", fontSize: "16px", color: "#333", fontFamily: "'Inter', sans-serif"}}>{errorMsg}</p>
              <button 
                onClick={() => setErrorMsg("")}
                style={{backgroundColor: "#F39C12", fontSize: "18px", width: "100%", padding: "15px", border: "none", borderRadius: "15px", color: "white", fontWeight: "700", cursor: "pointer"}}
              >
                Got it
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

export default SendOrder;