import React from 'react';

function SkeletonCard({ className = '' }) {
  return (
    <div className={`salesperson-dashboard-card animate-pulse ${className}`}>
      <div className="h-5 bg-slate-200 rounded w-1/3 m-4" />
      <div className="h-28 bg-slate-100 rounded-xl mx-4 mb-4 w-[90%]" />
    </div>
  );
}

export default function SalesIntelligenceSkeleton() {
  return (
    <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5 salesperson-dashboard-bg">
      <div className="w-full max-w-[1600px] mx-auto min-w-0 dashboard-sections">
        <div className="h-16 w-full bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <div className="flex flex-col gap-4 min-w-0">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <div className="salesperson-dashboard-card overflow-hidden">
              <div className="h-5 bg-slate-200 rounded w-40 m-4" />
              <div className="h-40 bg-slate-100 rounded-lg mx-4 mb-4 animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col gap-4 min-w-0">
            <SkeletonCard />
            <div className="salesperson-dashboard-card overflow-hidden">
              <div className="h-5 bg-slate-200 rounded w-40 m-4" />
              <div className="h-40 bg-slate-100 rounded-lg mx-4 mb-4 animate-pulse" />
            </div>
            <SkeletonCard />
            <div className="salesperson-dashboard-card overflow-hidden">
              <div className="h-5 bg-slate-200 rounded w-48 m-4" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 pt-0">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
