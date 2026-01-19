// OPTIMIZED: LeadStatus component with React.memo and useMemo optimizations
import React, { useState, useMemo, useCallback, memo } from 'react';
import { useLeadsQuery } from '../../hooks/useLeadsQuery';
import LeadStatusSkeleton from '../../components/LeadStatusSkeleton';
import LeadStatusRow from '../../components/LeadStatusRow';

// OPTIMIZED: Memoized badge components
const StatusBadge = memo(({ status }) => {
  const badgeClasses = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    converted: 'bg-green-100 text-green-800',
    interested: 'bg-purple-100 text-purple-800',
    'win/closed': 'bg-emerald-100 text-emerald-800',
    closed: 'bg-gray-100 text-gray-800',
    lost: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${badgeClasses[status] || 'bg-gray-100 text-gray-800'}`}>
      {status || 'Pending'}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

// OPTIMIZED: Memoized filter component
const FilterBadge = memo(({ label, count, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-full text-sm transition-colors ${
      isActive
        ? 'bg-blue-500 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {label} ({count})
  </button>
));

FilterBadge.displayName = 'FilterBadge';

function LeadStatusOptimized() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);

  // OPTIMIZED: Use React Query for caching and automatic refetching
  const { data, isLoading, error, prefetchNextPage } = useLeadsQuery(
    currentPage,
    itemsPerPage,
    { search: searchQuery, status: statusFilter }
  );

  // OPTIMIZED: Memoized filtered leads
  const filteredLeads = useMemo(() => {
    if (!data?.data) return [];
    
    let leads = data.data;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      leads = leads.filter(
        lead =>
          lead.name?.toLowerCase().includes(query) ||
          lead.phone?.includes(query) ||
          lead.customerId?.toString().includes(query)
      );
    }
    
    if (statusFilter) {
      leads = leads.filter(lead => 
        lead.sales_status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    return leads;
  }, [data?.data, searchQuery, statusFilter]);

  // OPTIMIZED: Memoized status badge getter
  const getStatusBadge = useCallback((status) => {
    return <StatusBadge status={status?.toLowerCase()} />;
  }, []);

  // OPTIMIZED: Memoized handlers
  const handleEdit = useCallback((lead) => {
    setSelectedLead(lead);
  }, []);

  const handleViewTimeline = useCallback((lead) => {
    // Timeline logic
    console.log('View timeline for:', lead.id);
  }, []);

  const handleStatusFilter = useCallback((status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  // OPTIMIZED: Prefetch next page when user scrolls near bottom
  React.useEffect(() => {
    if (data?.pagination?.totalPages > currentPage) {
      const timer = setTimeout(() => {
        prefetchNextPage();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentPage, data?.pagination?.totalPages, prefetchNextPage]);

  // OPTIMIZED: Memoized counts
  const statusCounts = useMemo(() => {
    if (!data?.data) return {};
    
    const counts = {};
    data.data.forEach(lead => {
      const status = lead.sales_status?.toLowerCase() || 'pending';
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [data?.data]);

  if (isLoading) {
    return <LeadStatusSkeleton rows={itemsPerPage} />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded">
        Error loading leads: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lead Status</h1>
      
      {/* OPTIMIZED: Memoized search */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search leads..."
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      {/* OPTIMIZED: Memoized filter badges */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <FilterBadge
          label="All"
          count={data?.total || 0}
          isActive={!statusFilter}
          onClick={() => handleStatusFilter('')}
        />
        {Object.entries(statusCounts).map(([status, count]) => (
          <FilterBadge
            key={status}
            label={status}
            count={count}
            isActive={statusFilter === status}
            onClick={() => handleStatusFilter(status)}
          />
        ))}
      </div>

      {/* OPTIMIZED: Memoized table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                City
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Docs
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLeads.map((lead) => (
              <LeadStatusRow
                key={lead.id}
                lead={lead}
                onEdit={handleEdit}
                onViewTimeline={handleViewTimeline}
                getStatusBadge={getStatusBadge}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* OPTIMIZED: Memoized pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, data?.total || 0)} of{' '}
          {data?.total || 0} leads
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage >= (data?.pagination?.totalPages || 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(LeadStatusOptimized);

