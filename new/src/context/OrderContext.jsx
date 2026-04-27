import React, { createContext, useState, useContext } from 'react';

const OrderContext = createContext();

export const useOrderContext = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orderData, setOrderData] = useState({
    category: '', // housemoving, towing, etc.
    truckType: '', // fourgon, harbina, etc.
    truckModel: '', // long, medium, short
    weight: '', // 1.2T, etc.
    
    pickup: '',
    delivery: '',
    distance: null,
    
    isNow: false,
    manualDate: '',
    manualTime: '',
    
    commodity: '',
    helpers: 0,
    phoneNumber: '',
    confirmationMethod: ''
  });

  const updateOrderData = (newData) => {
    setOrderData(prev => ({ ...prev, ...newData }));
  };

  return (
    <OrderContext.Provider value={{ orderData, updateOrderData }}>
      {children}
    </OrderContext.Provider>
  );
};
