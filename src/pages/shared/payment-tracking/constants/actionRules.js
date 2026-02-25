/**
 * Centralized rules for payment tracking row actions.
 * Use everywhere to avoid nested conditionals.
 */
export const DELIVERY_STATUS = {
  PENDING: 'Pending',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancel',
  PARTIAL_DELIVERED: 'Partial Delivered',
};

export const ACTION_RULES = {
  [DELIVERY_STATUS.PENDING]: {
    canCancel: true,
    canAddPayment: true,
    editable: true,
  },
  [DELIVERY_STATUS.PARTIAL_DELIVERED]: {
    canCancel: true,
    canAddPayment: true,
    editable: true,
  },
  [DELIVERY_STATUS.DELIVERED]: {
    canCancel: false,
    canAddPayment: false,
    editable: false,
  },
  [DELIVERY_STATUS.CANCELLED]: {
    canCancel: false,
    canAddPayment: false,
    editable: false,
  },
};

export function getActionRules(deliveryStatus) {
  const status = (deliveryStatus || DELIVERY_STATUS.PENDING).toString().trim();
  return ACTION_RULES[status] ?? ACTION_RULES[DELIVERY_STATUS.PENDING];
}

export function isDelivered(deliveryStatus) {
  return (deliveryStatus || '').toString().toLowerCase() === 'delivered';
}

export function isCancelled(deliveryStatus) {
  return (deliveryStatus || '').toString().toLowerCase() === 'cancel';
}
