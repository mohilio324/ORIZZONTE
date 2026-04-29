import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useOrderContext } from '../src/context/OrderContext.jsx';
import './OrderConfirmation.css';
import SendOrder from './SendOrder.jsx';

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const { orderData } = useOrderContext();

  // Create a display string for dateTime
  const displayDateTime = orderData.isNow
    ? "Now"
    : (orderData.manualDate && orderData.manualTime)
      ? `${orderData.manualDate} ${orderData.manualTime}`
      : "Not scheduled";

  // Fallback mock data if not navigated with state
  const submitData = {
    pickup: orderData.pickup || 'Alger Centre , الجزائر',
    delivery: orderData.delivery || 'Amizour , الجزائر بجاية',
    truckType: orderData.truckType || 'Fourgon',
    truckModel: orderData.truckModel || 'court',
    weight: orderData.weight || '1.2 L',
    commodity: orderData.commodity || 'salon complet (canapé, table basse, TV), chambre (lit double, matelas, armoire), plusieurs cartons de vêtements et de livres, électroménager (réfrigérateur, machine à laver), table avec chaises. Quelques objets fragiles comme la vaisselle, à manipuler avec précaution.',
    helpers: orderData.helpers || '03',
    dateTime: displayDateTime !== "Not scheduled" ? displayDateTime : '07/05/2024  9:00',
  };


  const handleConfirmOrder = async () => {
    try {
      const accessToken = localStorage.getItem("access_token");

      console.log("Submitting order data:", submitData);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/orders/",
        submitData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
        }
      );

      console.log("Order confirmed successfully:", response.data);
      alert("Order Confirmed!");
      navigate('/');
    } catch (err) {
      console.error("Order confirmation error:", err.response?.data || err.message);
      // Simulate success for UI showcase
      alert("Order Confirmed (Simulated API Call)!");
      navigate('/');
    }
  };

  return (
    <div className="oc-container">
      <header className="oc-top-nav">
        <div style={{ width: '50px' }}></div>
        <img src="/images/logo.svg" alt="Orizzonte" className="oc-logo" />
        <button className="oc-cancel-link" onClick={() => navigate("/sendorder")}>cancel</button>
      </header>

      <div className="oc-back-wrapper">
        <button className="oc-back-btn" onClick={() => navigate('/sendorder')}>
          <img src="/images/ARROW.svg" alt="Back" /> <span>New order</span>
        </button>
      </div>

      <main className="oc-main-content">

        {/* Section 1: Trip Route */}
        <section className="oc-section">
          <div className="oc-section-header">
            <h2>Trip route</h2>
            <button className="oc-edit-btn" onClick={() => navigate('/time')}>EDIT</button>
          </div>
          <div className="oc-route-timeline">
            <div className="oc-route-point">
              <div className="oc-route-icon">
                <span style={{ fontSize: '20px', lineHeight: '1' }}>🎯</span>
              </div>
              <span className="oc-route-text">{submitData.pickup}</span>
            </div>
            <div className="oc-route-point">
              <div className="oc-route-icon">
                <span style={{ color: '#F5A623', fontSize: '20px', lineHeight: '1' }}>🔸</span>
              </div>
              <span className="oc-route-text">{submitData.delivery}</span>
            </div>
          </div>
        </section>

        {/* Section 2: Vehicle Details */}
        <section className="oc-section">
          <div className="oc-section-header">
            <h2>Vehicle Details</h2>
            <button className="oc-edit-btn" onClick={() => navigate('/NewOrder1')}>EDIT</button>
          </div>
          <div className="oc-vehicle-grid">
            <div className="oc-detail-block" style={{ gridColumn: '1 / -1' }}>
              <span className="oc-detail-label">Truck Type</span>
              <span className="oc-detail-value" style={{ paddingLeft: '2rem' }}>{submitData.truckType}</span>
            </div>
            <div className="oc-detail-block">
              <span className="oc-detail-label">Truck model</span>
              <span className="oc-detail-value" style={{ paddingLeft: '2rem' }}>{submitData.truckModel}</span>
            </div>
            <div className="oc-detail-block">
              <span className="oc-detail-label">Weight</span>
              <span className="oc-detail-value">{submitData.weight}</span>
            </div>
          </div>
        </section>

        {/* Section 3: Time and Commodity */}
        <section className="oc-section" style={{ borderBottom: 'none' }}>
          <div className="oc-section-header">
            <h2>Time and Commodity</h2>
            <button className="oc-edit-btn" onClick={() => navigate('/time')}>EDIT</button>
          </div>
          <div className="oc-tc-grid">
            <div className="oc-commodity-block">
              <span className="oc-detail-label">commodity</span>
              <p className="oc-commodity-text">
                {submitData.commodity}
              </p>
            </div>
            <div className="oc-stats-col">
              <div className="oc-detail-block">
                <span className="oc-detail-label">Helpers</span>
                <span className="oc-detail-value" style={{ paddingLeft: '1rem' }}>{submitData.helpers}</span>
              </div>
              <div className="oc-detail-block">
                <span className="oc-detail-label">Date and time</span>
                <span className="oc-detail-value" style={{ fontSize: '0.9rem' }}>{submitData.dateTime}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="oc-actions-wrapper">
          <button className="oc-btn-secondary">
            Get Estimate
          </button>
          <button className="oc-btn-primary" onClick={handleConfirmOrder}>
            Confirm Order
          </button>
        </div>

      </main>
    </div>
  );
}