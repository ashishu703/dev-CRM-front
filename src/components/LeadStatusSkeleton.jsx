// OPTIMIZED: Loading skeleton for LeadStatus page
import React from 'react';
import { Skeleton } from './ui/Skeleton';

export default function LeadStatusSkeleton({ rows = 10 }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading leads">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4 bg-gray-200" />
              <Skeleton className="h-3 w-1/3 bg-gray-200" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 rounded-lg bg-gray-200" />
              <Skeleton className="h-8 w-16 rounded-lg bg-gray-200" />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Skeleton className="h-6 rounded-full w-20 bg-gray-200" />
            <Skeleton className="h-6 rounded-full w-24 bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

