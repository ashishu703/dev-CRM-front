import React from 'react';
import { Clock, Loader } from 'lucide-react';
import ActivityItem from './ActivityItem';
import ActivityFilter from './ActivityFilter';
import { useActivityTimeline } from './ActivityTimelineBase';

/**
 * Simple activity timeline with Salesforce-style grouping
 * O(1) rendering complexity per activity group
 */
const ActivityTimeline = ({ leadId }) => {
  const {
    groupedActivities,
    loading,
    hasMore,
    activeFilter,
    stats,
    observerTarget,
    handleFilterChange
  } = useActivityTimeline(leadId);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
        </div>
        <ActivityFilter 
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          stats={stats}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {groupedActivities.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mb-2 opacity-50" />
            <p>No activities found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedActivities.map((group) => (
              <ActivityItem 
                key={group.id}
                activity={group.activities[0]}
                groupedActivities={group.activities}
              />
            ))}
            
            {hasMore && (
              <div ref={observerTarget} className="flex justify-center py-4">
                {loading && <Loader className="w-6 h-6 animate-spin text-blue-600" />}
              </div>
            )}
            
            {!hasMore && groupedActivities.length > 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                No more activities
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
