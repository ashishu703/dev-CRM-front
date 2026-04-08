import React from 'react';
import { Skeleton } from '../ui/Skeleton';

const bar = 'bg-gray-200';

// Reusable skeleton components for dashboard
export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-white rounded-lg p-6 border border-gray-200 ${className}`}>
    <Skeleton className={`h-4 w-1/3 mb-4 ${bar}`} />
    <Skeleton className={`h-8 w-1/2 mb-2 ${bar}`} />
    <Skeleton className={`h-3 w-2/3 ${bar}`} />
  </div>
);

export const SkeletonStatCard = () => (
  <div className="bg-white rounded-lg p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className={`h-4 w-1/2 ${bar}`} />
      <Skeleton className={`h-8 w-8 rounded ${bar}`} />
    </div>
    <Skeleton className={`h-8 w-1/3 mb-2 ${bar}`} />
    <Skeleton className={`h-3 w-2/3 ${bar}`} />
  </div>
);

export const SkeletonChart = () => (
  <div className="bg-white rounded-lg p-6 border border-gray-200">
    <Skeleton className={`h-5 w-1/3 mb-6 ${bar}`} />
    <Skeleton className={`h-64 w-full ${bar}`} />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-white rounded-lg border border-gray-200">
    <div className="p-4 border-b border-gray-200">
      <Skeleton className={`h-5 w-1/4 ${bar}`} />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="p-4 border-b border-gray-200 last:border-b-0">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className={`h-4 w-1/3 ${bar}`} />
          <Skeleton className={`h-4 w-1/4 ${bar}`} />
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
            <Skeleton className="h-10 w-24 rounded-lg bg-gray-200" />
            <Skeleton className="h-10 w-32 rounded-lg bg-gray-200" />
            <Skeleton className="h-10 w-40 rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Sales Department Section */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <Skeleton className="h-6 w-6 rounded bg-gray-200" />
          <Skeleton className="h-7 w-48 rounded bg-gray-200" />
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
          <Skeleton className="h-6 w-6 rounded bg-gray-200" />
          <Skeleton className="h-7 w-56 rounded bg-gray-200" />
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
          <Skeleton className="h-6 w-6 rounded bg-gray-200" />
          <Skeleton className="h-7 w-40 rounded bg-gray-200" />
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

