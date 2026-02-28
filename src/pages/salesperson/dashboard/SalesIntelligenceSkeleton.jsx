import React from 'react';

function SkeletonCard({ className = '', lines = 1 }) {
  return (
    <div className={`salesperson-dashboard-card overflow-hidden animate-pulse ${className}`}>
      <div className="p-4 border-b border-slate-200/80">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-3 bg-slate-100 rounded w-2/3 mt-2" />
      </div>
      <div className="p-4">
        {lines === 1 ? (
          <div className="h-24 bg-slate-100 rounded-xl w-full" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-lg" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SalesIntelligenceSkeleton() {
  return (
    <main className="flex-1 overflow-y-auto dashboard-container salesperson-dashboard-bg text-[13px]">
      <div className="dashboard-sections w-full max-w-[1600px] mx-auto min-w-0">
        {/* Greeting row */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0 space-y-2">
            <div className="h-6 bg-slate-200 rounded w-48 animate-pulse" />
            <div className="h-4 bg-slate-100 rounded w-64 animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-slate-200 rounded-lg animate-pulse" />
        </div>

        {/* 1. KPI (2 col) + Follow-up (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="min-w-0 lg:col-span-2">
            <div className="salesperson-dashboard-card overflow-hidden animate-pulse">
              <div className="p-4 border-b border-slate-200/80">
                <div className="h-4 bg-slate-200 rounded w-32" />
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <SkeletonCard lines={1} />
          </div>
        </div>

        {/* 2. Sales Pipeline */}
        <SkeletonCard className="min-h-[120px]" />

        {/* 3. Target & Revenue — 4 cards + bar + 4 cards + graph */}
        <div className="salesperson-dashboard-card overflow-hidden animate-pulse">
          <div className="p-4 border-b border-slate-200/80">
            <div className="h-4 bg-slate-200 rounded w-40" />
            <div className="h-3 bg-slate-100 rounded w-56 mt-1" />
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-lg" />
              ))}
            </div>
            <div className="h-3 bg-slate-200 rounded-full w-full" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-lg" />
              ))}
            </div>
            <div className="h-[140px] bg-slate-100 rounded-lg w-full" />
          </div>
        </div>

        {/* 4. Lead Priority */}
        <SkeletonCard />

        {/* 5. Running Order */}
        <div className="salesperson-dashboard-card overflow-hidden animate-pulse">
          <div className="p-4 border-b border-slate-200/80 flex justify-between">
            <div>
              <div className="h-4 bg-slate-200 rounded w-28" />
              <div className="h-3 bg-slate-100 rounded w-48 mt-1" />
            </div>
            <div className="h-9 w-20 bg-slate-200 rounded-lg" />
          </div>
          <div className="p-4">
            <div className="h-10 bg-slate-100 rounded w-full mb-2" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-slate-100 rounded w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* 6. Map | Lead Source */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </main>
  );
}
