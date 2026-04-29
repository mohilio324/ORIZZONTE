/**
 * Maps frontend order context data to the backend API schema.
 * 
 * Backend (missions/models.py) expects:
 * - truck_type: "small" | "medium" | "large" | "extra_large"
 * - category: "open" | "closed" | "refrigerated" | "flatbed"
 * - size: "small" | "medium" | "big"
 */

export const mapOrderToEstimatePayload = (orderData) => {
    // 1. Map Truck Type (Frontend types -> Backend choices)
    const truckTypeMap = {
      fourgon: 'medium',
      harbina: 'small',
      camion: 'large',
      commercial: 'extra_large'
    };
  
    // 2. Map Size (S, M, L, XL -> small, medium, big)
    let size = 'small';
    const model = (orderData.truckModel || '').toLowerCase();
    const weight = parseFloat(orderData.weight) || 0;
  
    if (model.includes('long') || model.includes('grand') || weight > 5) {
      size = 'big';
    } else if (model.includes('moyen') || weight > 2) {
      size = 'medium';
    }

    // 3. Map Truck Category (Backend choice)
    // Most household/commercial moves use a 'closed' truck. 
    // Towing might use 'flatbed'.
    let truckCategory = 'closed';
    if (orderData.category === 'towing') {
        truckCategory = 'flatbed';
    }
  
    return {
      truck_type: truckTypeMap[orderData.truckType] || 'large',
      category: truckCategory,
      capacity: Math.max(1, parseInt(orderData.weight) || 1),
      size: size,
      departure_latitude: orderData.pickup?.lat || 36.75,
      departure_longitude: orderData.pickup?.lng || 3.05,
      arrival_latitude: orderData.delivery?.lat || 36.70,
      arrival_longitude: orderData.delivery?.lng || 3.10,
      distance: parseFloat(orderData.distance) || 10.0,
      date: orderData.date || new Date().toISOString().split('T')[0],
      time: orderData.time || "09:00",
      workers: parseInt(orderData.helpers) || 0
    };
  };
  
  export const mapOrderToConfirmPayload = (orderData) => {
    const base = mapOrderToEstimatePayload(orderData);
    return {
      ...base,
      shipment_type: orderData.shipmentType || 'house_moving',
      phone_number: orderData.phoneNumber || '0550000000'
    };
  };
