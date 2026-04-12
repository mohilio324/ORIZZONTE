import { Route, Routes, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./carbon-chemicals.css";

function CarbonChemicals() {
  const Navigate = useNavigate();

  const handleNewOrder2 = (e) => {
    e.preventDefault();
    Navigate("/");
  };

  const [selection, setSelection] = useState({ type: null, subType: null, capacity: null });

  const TRUCK_TYPES = [
   
    { id: "camion", label: "citerne", img: "/images/CAMION_CITERNE.svg" },
  
  ];

  

 

   const CAMION_SUB_CATEGORIES = [
    {
      id: "camion-large",
      label: "carburant",
      img: "/images/CAMION_CARBURANT.svg",
    },
   
  ];



  const FOURGOUN_CAPACITY = {
    "camion-large": [{ id: "18000l", label: "18000L" },{ id: "240000l", label: "240000L" },{ id: "270000l", label: "270000L" },{ id: "300000l", label: "300000L" },],
   
    
  };

  return (
    <div className="wrapper">
      <div className="logo">
        <img src="/images/logo.svg" alt="" />
      </div>

      <div className="New-Order-back">
        <button>
          <img src="/images/ARROW.svg" alt="" /> <span>New Order</span>
        </button>
      </div>
      <div className="text-area">
        <h2>Truck type</h2>
        <span>select the truck that fits the cargo </span>
      </div>

      <div className="da-grid">
        {TRUCK_TYPES.map((truck) => (
          <button
            id=""
            className={selection.type === truck.id ? "active" : "non-active"}
            key={truck.id}
            onClick={() => {
              console.log(truck.id);
              setSelection({ type: truck.id, subType: null, capacity: null });
            }}
          >
            <img src={truck.img} alt="" /> <span>{truck.label}</span>
          </button>
        ))}
      </div>

      <div className="sub-category">
        <div className="text-area">
          <h2>Category</h2>
          <p>Select truck category</p>
        </div>
        
      

          {selection.type === "camion" && (
          <div className="da-grid">
            {CAMION_SUB_CATEGORIES.map((van) => (
              <button
                id=""
                className={selection.subType === van.id ? "active" : "non-active"}
                key={van.id}
                onClick={() => {
                  console.log(van.id);
                  setSelection({ ...selection, subType: van.id, capacity: null });
                }}
              >
                <img src={van.img} alt="" /> <span>{van.label}</span>
              </button>
            ))}
          </div>
        )}

     

        <div className="text-area">
          <h2>Capacity</h2>
          <p>Select desired capacity</p>
        </div>


     
        {selection.subType && (
          <div className="da-grid">
            {FOURGOUN_CAPACITY[selection.subType]?.map((van_capacity) => (
              
              <button
                id=""
                className={
                  selection.capacity === van_capacity.id ? "active-capacity" : "non-active-capacity"
                }
                key={van_capacity.id}
                onClick={() => {
                  setSelection({ ...selection, ...selection, capacity: van_capacity.id });
                  console.log(
                    "the type:" +
                      selection.type +
                      "\n" +
                      "the sub type:" +
                      selection.subType +
                      "\n" +
                      "the capacitty:" +
                      van_capacity.id
                  );
                }}
              >
                <span>{van_capacity.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export default CarbonChemicals;