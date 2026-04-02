import { useMemo } from 'react';
import { useGetPaymentTrackingQuery } from '../../../../features/paymentTracking/paymentTrackingApi';
import { mapPaymentTrackingResponse } from '../services/paymentTrackingMapper';

const EMPTY = {
  orderRows: [],
  activeOrderProductRows: [],
  pendingRows: [],
  statementRows: [],
  creditRows: [],
  outstandingRows: [],
  allPayments: [],
  targetSummary: { totalTarget: 0, achieved: 0, remaining: 0, progressPct: 0, requiredPerDay: 0, daysLeftInPeriod: 0 },
  targetList: [],
};

export function usePaymentTrackingData(enabled = true) {
  const { data: raw = {}, isLoading: initialLoading, isFetching: loading, refetch } = useGetPaymentTrackingQuery({}, { skip: !enabled });
  const mapped = useMemo(() => (raw && Object.keys(raw).length ? mapPaymentTrackingResponse(raw) : EMPTY), [raw]);
  return {
    ...mapped,
    loading,
    initialLoading,
    refresh: refetch,
  };
}
