import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, DollarSign, Scissors, Ban, Lock } from 'lucide-react';
import { getActionRules, isDelivered } from '../constants/actionRules';

/**
 * Single Actions (⋮) dropdown. Shows only valid actions; delivered row shows "Delivered (Locked)".
 */
export default function ActionMenu({
  deliveryStatus,
  onAddPayment,
  onCancelProduct,
  onCancelOrder,
  payment,
  cancelItemFull,
  productName,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const rules = getActionRules(deliveryStatus);
  const delivered = isDelivered(deliveryStatus);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleAddPayment = () => {
    payment && onAddPayment?.(payment);
    setOpen(false);
  };
  const handleCancelProduct = () => {
    if (cancelItemFull && productName) onCancelProduct?.({ ...cancelItemFull, productName, partial: true, deliveryStatus });
    setOpen(false);
  };
  const handleCancelOrder = () => {
    if (cancelItemFull) onCancelOrder?.({ ...cancelItemFull, deliveryStatus });
    setOpen(false);
  };

  return (
    <div className="relative flex justify-center" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Actions"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {delivered ? (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" /> Delivered (Locked)
            </div>
          ) : (
            <>
              {rules.canAddPayment && payment && (
                <button
                  type="button"
                  onClick={handleAddPayment}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Add Payment
                </button>
              )}
              {rules.canCancel && cancelItemFull && (
                <>
                  <button
                    type="button"
                    onClick={handleCancelProduct}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Scissors className="w-4 h-4 text-sky-600" /> Cancel product
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <Ban className="w-4 h-4" /> Cancel order
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
