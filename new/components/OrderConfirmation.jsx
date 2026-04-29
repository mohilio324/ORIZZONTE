import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../src/api.js';
import { useOrderContext } from '../src/context/OrderContext.jsx';
import { mapOrderToConfirmPayload } from '../src/utils/orderMapper.js';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const { orderData } = useOrderContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimate, setEstimate] = useState(null);

  // Create a display string for UI display
  const displayDateTime = orderData.isNow
    ? "Now"
    : (orderData.manualDate && orderData.manualTime)
      ? `${orderData.manualDate} ${orderData.manualTime}`
      : "Not scheduled";

  const handleGetEstimate = async () => {
    try {
      const payload = mapOrderToConfirmPayload(orderData);
      const response = await api.post("/missions/estimate/", payload);
      setEstimate(response.data.estimated_price);
    } catch (err) {
      console.error("Estimate error:", err);
      alert("Could not get estimate. Using default rates.");
    }
  };

  const handleConfirmOrder = async () => {
    setIsSubmitting(true);
    try {
      // Map the raw orderData from context to the backend schema
      const payload = mapOrderToConfirmPayload(orderData);
      
      console.log("Submitting real payload to backend:", payload);

      const response = await api.post("/missions/confirm/", payload);

      console.log("Order confirmed successfully:", response.data);
      alert(`✅ Order Confirmed! Mission ID: #${response.data.id}`);
      navigate('/');
    } catch (err) {
      console.error("Order confirmation error details:", err.response?.data);
      let errorMsg = "Failed to confirm order. Please check your connection.";
      
      if (err.response?.data) {
        const data = err.response.data;
        // Handle common DRF error formats
        if (typeof data === 'object') {
           errorMsg = Object.entries(data)
             .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
             .join(' | ');
        } else if (typeof data === 'string') {
           errorMsg = data;
        }
      }
      
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
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
              <span className="oc-route-text">
                {typeof orderData.pickup === 'object' ? orderData.pickup?.address : (orderData.pickup || 'Pickup Location')}
              </span>
            </div>
            <div className="oc-route-point">
              <div className="oc-route-icon">
                <span style={{ color: '#F5A623', fontSize: '20px', lineHeight: '1' }}>🔸</span>
              </div>
              <span className="oc-route-text">
                {typeof orderData.delivery === 'object' ? orderData.delivery?.address : (orderData.delivery || 'Destination')}
              </span>
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
              <span className="oc-detail-value" style={{ paddingLeft: '2rem' }}>{orderData.truckType || 'Fourgon'}</span>
            </div>
            <div className="oc-detail-block">
              <span className="oc-detail-label">Truck model</span>
              <span className="oc-detail-value" style={{ paddingLeft: '2rem' }}>{orderData.truckModel || 'Standard'}</span>
            </div>
            <div className="oc-detail-block">
              <span className="oc-detail-label">Weight</span>
              <span className="oc-detail-value">{orderData.weight || '0'} L</span>
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
                {orderData.commodity || 'No description provided.'}
              </p>
            </div>
            <div className="oc-stats-col">
              <div className="oc-detail-block">
                <span className="oc-detail-label">Helpers</span>
                <span className="oc-detail-value" style={{ paddingLeft: '1rem' }}>{orderData.helpers || '00'}</span>
              </div>
              <div className="oc-detail-block">
                <span className="oc-detail-label">Date and time</span>
                <span className="oc-detail-value" style={{ fontSize: '0.9rem' }}>{displayDateTime}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="oc-actions-wrapper">
          {estimate && (
            <div className="oc-estimate-display" style={{ 
              marginBottom: '1.5rem', 
              textAlign: 'center', 
              width: '100%',
              padding: '1.5rem',
              background: 'rgba(255, 173, 1, 0.1)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 173, 1, 0.3)'
            }}>
              <div style={{ color: 'var(--grey-light)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>ESTIMATED TOTAL</div>
              <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#FFAD01' }}>{parseFloat(estimate).toLocaleString()} <small style={{ fontSize: '1.2rem' }}>DZD</small></div>
            </div>
          )}
          <button className="oc-btn-secondary" onClick={handleGetEstimate}>
            {estimate ? "Refresh Estimate" : "Get Estimate"}
          </button>
          <button className="oc-btn-primary" onClick={handleConfirmOrder} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Confirm Order"}
          </button>
        </div>

      </main>
    </div>
  );
}