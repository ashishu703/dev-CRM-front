import React from 'react';
import { Skeleton, TableRowsSkeleton } from '../ui/Skeleton';

/** Accounts dashboard: header, 3 metric cards, pending table preview */
export function AccountsDashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-56 max-w-full" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex gap-3">
              <Skeleton className="h-11 w-11 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-3 w-full max-w-[180px]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-100">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                {['Lead ID', 'Customer', 'Business', 'Amount', 'Quotation', 'Date'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left">
                    <Skeleton className="h-3 w-16" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <TableRowsSkeleton rows={5} columns={6} tdClassName="px-6 py-4" />
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-3 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-[80%]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Payment info: desktop 8-column rows (matches PAYMENT_TABLE_HEADERS) */
export function AccountsPaymentTableSkeleton({ rows = 6 }) {
  return <TableRowsSkeleton rows={rows} columns={8} tdClassName="px-5 py-4" />;
}

/** Payment info: mobile card stack */
export function AccountsPaymentMobileSkeleton({ cards = 3 }) {
  return (
    <div className="space-y-4 p-4 bg-gradient-to-b from-indigo-50/40 to-transparent" aria-hidden>
      {Array.from({ length: cards }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-indigo-100 bg-white p-4 space-y-3 shadow-sm ring-1 ring-violet-50"
        >
          <div className="flex justify-between gap-2">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-4 w-[75%] max-w-[200px]" />
            </div>
            <div className="flex gap-1">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/** View modal — installment breakdown area */
export function InstallmentBreakdownSkeleton() {
  return (
    <div className="space-y-4 pt-2" aria-busy="true" aria-label="Loading installment breakdown">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-slate-200 p-3 space-y-2">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
        ))}
      </div>
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {Array.from({ length: 6 }).map((_, j) => (
                <th key={j} className="px-4 py-2 text-left">
                  <Skeleton className="h-3 w-14" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            <TableRowsSkeleton rows={4} columns={6} tdClassName="px-4 py-2.5" />
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Price management grid */
export function PriceManagementSkeleton() {
  return (
    <div className="p-6 space-y-6" aria-busy="true" aria-label="Loading prices">
      <div className="flex items-center gap-2 mb-1">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-8 w-48" />
      </div>
      <Skeleton className="h-4 w-64 ml-11" />

      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-44 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <Skeleton className="h-4 w-[85%]" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
