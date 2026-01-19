import React from 'react';

// Reusable skeleton components for dashboard
export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-lg p-6 border border-gray-200 animate-pulse ${className}`}>
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
  </div>
);

export const SkeletonStatCard = () => (
  <div className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-8 w-8 bg-gray-200 rounded"></div>
    </div>
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
  </div>
);

export const SkeletonChart = () => (
  <div className="bg-white rounded-lg p-6 border border-gray-200 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-1/3 mb-6"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-white rounded-lg border border-gray-200 animate-pulse">
    <div className="p-4 border-b border-gray-200">
      <div className="h-5 bg-gray-200 rounded w-1/4"></div>
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="p-4 border-b border-gray-200 last:border-b-0">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    ))}
  </div>
);

// Main dashboard skeleton loader
const DashboardSkeleton = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Sales Department Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-7 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        
        {/* Lead Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>

        {/* Target Timeline & Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SkeletonChart />
          <SkeletonTable rows={3} />
        </div>

        {/* Business Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>

      {/* Accounts Department Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-7 bg-gray-200 rounded w-56 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      </div>

      {/* IT Department Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-7 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;

