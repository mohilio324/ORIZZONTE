import './Services.css';

const services = [
  {
    icon: '/images/residential.svg',
    title: 'Residential Moving',
    description: 'Home to home, we handle your memories with care.',
    position: 'top'
  },
  {
    icon: '/images/building.svg',
    title: 'Corporate Relocation',
    description: 'Efficient office moves with minimal downtime.',
    position: 'bottom'
  },
  {
    icon: '/images/box.svg',
    title: 'Professional Packing',
    description: 'Custom crating and specialized packing services.',
    position: 'top'
  },
  {
    icon: '/images/delivery-truck.svg',
    title: 'Freight Shipping',
    description: 'Large scale logistics via air, land, or sea.',
    position: 'bottom'
  },
  {
    icon: '/images/towing-vehicle.svg',
    title: 'Vehicle Transport',
    description: 'Safe transit for cars, bikes, and luxury vehicles.',
    position: 'top'
  }
];

export default function Services() {
  return (
    <section id="services" className="services-section">
      <div className="services-header">
        <h2 className="services-title">
          Our Best <span className="highlight">Services</span>
        </h2>
        <p className="services-subtitle">
          We always do our best in serving our customers and give them a satisfied impression
        </p>
      </div>

      <div className="services-container">
        <div className="services-line"></div>
        <div className="services-grid">
          {services.map((service, index) => (
            <div
              key={index}
              className={`service-card ${service.position}`}
            >
              <div className="service-icon-wrapper">
                <img src={service.icon} alt={service.title} className="service-icon" />
              </div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
