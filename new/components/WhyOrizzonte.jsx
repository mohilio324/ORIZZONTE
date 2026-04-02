import "./WhyOrizzonte.css";

export default function WhyOrizzonte() {
  return (
    <section className="why-orizzonte">
      <div className="why-orizzonte-inner">
        <div className="why-left">
          <h2 className="section-title left">
            <span className="why-prefix">WHY</span>
            <span className="accent">ORIZZONTE</span>
            <span className="accent question-mark">?</span>
          </h2>

          <div className="why-list">
            <div className="why-item">
              <div className="why-icon-circle">
                <img src="/images/truck icon.svg" alt="Diverse fleet icon" />
              </div>
              <div>
                <h3 className="why-item-title">Diverse Fleet</h3>
                <p className="why-item-text why-item-text--single-line">
                  Access all vehicle types: vans, trucks, tankers and more.
                </p>
              </div>
            </div>

            <div className="why-item">
              <div className="why-icon-circle">
                <img src="/images/location icon.svg" alt="National coverage icon" />
              </div>
              <div>
                <h3 className="why-item-title">National coverage</h3>
                <p className="why-item-text">
                  Transport available throughout the country.
                </p>
              </div>
            </div>

            <div className="why-item">
              <div className="why-icon-circle">
                <img src="/images/time icon.svg" alt="Fast and reliable icon" />
              </div>
              <div>
                <h3 className="why-item-title">Fast &amp; Reliable</h3>
                <p className="why-item-text">
                  Get offers in minutes and track your shipment in real-time.
                </p>
              </div>
            </div>

            <div className="why-item">
              <div className="why-icon-circle">
                <img src="/images/verified.svg" alt="Verified carriers icon" />
              </div>
              <div>
                <h3 className="why-item-title">Verified Carriers</h3>
                <p className="why-item-text">
                  All our carriers are verified and rated by our community.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="why-right">
          <img src="/images/second pic.svg" alt="Why Orizzonte" className="why-main-visual" />
        </div>
      </div>
    </section>
  );
}

