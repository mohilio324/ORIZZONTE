import { Route, Routes, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./towing.css";

function Towing() {
  const Navigate = useNavigate();

  const handleNewOrder2 = (e) => {
    e.preventDefault();
    Navigate("/");
  };

  const [selection, setSelection] = useState({ type: null, subType: null, capacity: null });

  const TRUCK_TYPES = [
    { id: "porte-chare", label: "porte chare", img: "/images/PORTE_CHARE.svg" },
    { id: "depannage", label: "depannage", img: "/images/DEPANNAGE.svg" },
   
  ];

  const PORTE_SUB_CATEGORIES = [
    {
      id: "porte-long",
      label: "long",
      img: "/images/FOURGON_GENERAL.svg",
    },
    {
      id: "fourgon-medium",
      label: "medium",
      img: "/images/FOURGON_GENERAL.svg",
    },
    {
      id: "fourgon-short",
      label: "short",
      img: "/images/FOURGON_GENERAL.svg",
    },
  ];

  const DEPANNAGE_SUB_CATEGORIES = [
    {
      id: "harbina-large",
      label: "large",
      img: "/images/HARBINA_GENERAL.svg",
    },
    {
      id: "harbina-small",
      label: "small",
      img: "/images/HARBINA_GENERAL.svg",
    },
  ];

 



  const FOURGOUN_CAPACITY = {
    "fourgon-long": [{ id: "2t", label: "2T" }],
    "fourgon-medium": [{ id: "1.5t", label: "1.5T" }],
    "fourgon-short": [{ id: "1.2t", label: "1.2T" }],
    "harbina-large": [{ id: "1.5t", label: "1.5T" }],
    "harbina-small": [{ id: "1t", label: "1T" } ,  ],
    
  };

  return (
    <div className="wrapper">
      <div className="logo">
        <img src="/images/logo.svg" alt="" />
      </div>

      <div className="New-Order-back">
        <button onClick={() =>Navigate('/NewOrder1')}>
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
        {selection.type === "porte-chare" && (
          <div className="da-grid">
            {PORTE_SUB_CATEGORIES.map((van) => (
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

        {selection.type === "depannage" && (
          <div className="da-grid">
            {DEPANNAGE_SUB_CATEGORIES.map((van) => (
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
export default Towing;
