import React from 'react';
import { SkeletonTable, SkeletonStatCard } from '../dashboard/DashboardSkeleton';

/**
 * Shared skeleton loader for Payment Info screens (SuperAdmin + Department Head).
 * Uses dashboard skeleton pieces so the loading state looks identical across roles.
 */
const PaymentInfoSkeleton = () => {
  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
      </div>

      {/* Stats Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Search + filters + table area skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="h-10 bg-gray-200 rounded w-full lg:w-96 animate-pulse" />
          <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded w-28 animate-pulse" />
          </div>
        </div>

        <SkeletonTable rows={10} />
      </div>
    </div>
  );
};

export default PaymentInfoSkeleton;

