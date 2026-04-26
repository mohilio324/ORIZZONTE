import { Route, Routes, useNavigate } from "react-router-dom";

import "./NewOrder1.css";

function NewOrder1() {
  const Navigate = useNavigate();

  const handleNewOrder1 = (e) => {
    e.preventDefault();
    Navigate("/");
  };

  return (
    <div className="wrapper">
      <div className="logo"><img src="/images/logo.svg" alt="" /></div>

      <div className="New-Order-back">
        <button onClick={() => Navigate('/')}><img src="/images/ARROW.svg" alt="" /> <span>New Order</span></button>
      </div>
      <div className="text-area">
        <h2>What do you need to ship?</h2>
        <span>choose what kind of cargo you need to ship </span>
      </div>

      <div className="da-grid">
        <button id="" className="" onClick={() => Navigate('/housemoving')}>
          <img src="/images/SOFA.svg" alt="" /> <span>House moving &
            personal effects</span>
        </button>
        <button onClick={() => Navigate('/commercial_merchandise')} id="" className="" >
          <img src="/images/MARKET.svg" alt="" /> <span>Commercial
            marchandise</span>
        </button>
        <button onClick={() => Navigate('/heavy-equipment')}>
          <img src="/images/CONE.svg" alt="" /> <span>Heavy equipment</span>
        </button>
        <button id="" className="" onClick={() => Navigate('/carbon-chemicals')}>
          <img src="/images/GAS.svg" alt="" /> <span>Carbon &
            chemicals</span>
        </button>
        <button id="" className="" onClick={() => Navigate('/towing')}>
          <img src="/images/TOW-TRUCK.svg" alt="" /> <span>Towing</span>
        </button>
        <button id="" className="" onClick={() => Navigate('/construction-materials')}>
          <img src="/images/CRANE.svg" alt="" /> <span>Construction
            materials </span>
        </button>
        <button id="" className="" onClick={() => Navigate('/water')}>
          <img src="/images/WATER.svg" alt="" /> <span>Water</span>
        </button>
        <button id="" className="" onClick={() => Navigate('/appliances')}>
          <img src="/images/CHARGER.svg" alt="" /> <span>Appliances</span>
        </button>
      </div>
    </div>
  );
}
export default NewOrder1;
