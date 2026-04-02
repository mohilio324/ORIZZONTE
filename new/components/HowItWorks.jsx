import "./HowItWorks.css";

export default function HowItWorks() {
  return (
    <section className="how-it-works">
      <div className="how-inner">
        <h2 className="section-title">How it works ?</h2>

        <div className="steps">
          <div className="step">
            <div className="step-header">
              <h3 className="step-title">Describe your shipment</h3>
              <div className="step-shape-wrapper">
                <img src="/images/01 shape.svg" alt="Step 1 shape" className="step-shape" />
                <span className="step-number-on-shape">01</span>
              </div>
            </div>
            <p className="step-text">
              Enter cargo details,<br />pickup and delivery<br />addresses
            </p>
          </div>

          <div className="step">
            <div className="step-header">
              <h3 className="step-title">Receive<br />offers</h3>
              <div className="step-shape-wrapper">
                <img src="/images/02 shape.svg" alt="Step 2 shape" className="step-shape" />
                <span className="step-number-on-shape">02</span>
              </div>
            </div>
            <p className="step-text">
              Verified carriers send<br />you their best offers in<br />minutes.
            </p>
          </div>

          <div className="step">
            <div className="step-header">
              <h3 className="step-title">Choose<br />&amp; track</h3>
              <div className="step-shape-wrapper">
                <img src="/images/03 shape.svg" alt="Step 3 shape" className="step-shape" />
                <span className="step-number-on-shape">03</span>
              </div>
            </div>
            <p className="step-text">
              Select the offer that suits<br />you and track your<br />delivery in real-time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
