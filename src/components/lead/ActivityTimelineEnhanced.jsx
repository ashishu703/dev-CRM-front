import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Loader, ChevronDown, ChevronRight } from 'lucide-react';
import ActivityItem from './ActivityItem';
import ActivityFilter from './ActivityFilter';
import { useActivityTimeline } from './ActivityTimelineBase';

/**
 * Groups activity groups by date with O(n) complexity
 * Uses Map for O(1) lookups
 */
const groupActivitiesByDate = (groupedActivities) => {
  const groups = new Map();
  
  groupedActivities.forEach(group => {
    const firstActivity = group.activities[0];
    const date = new Date(firstActivity.created_at);
    const dateKey = date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    
    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        date: dateKey,
        timestamp: date.getTime(),
        groups: []
      });
    }
    
    groups.get(dateKey).groups.push(group);
  });
  
  return Array.from(groups.values()).sort((a, b) => b.timestamp - a.timestamp);
};

const DateGroup = React.memo(({ group, isExpanded, onToggle }) => {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        )}
        <span className="font-medium text-gray-900">{group.date}</span>
        <span className="text-sm text-gray-500">
          ({group.groups.length} {group.groups.length === 1 ? 'update' : 'updates'})
        </span>
      </button>
      
      {isExpanded && (
        <div className="mt-2 ml-6 space-y-2">
          {group.groups.map((activityGroup) => (
            <ActivityItem 
              key={activityGroup.id}
              activity={activityGroup.activities[0]}
              groupedActivities={activityGroup.activities}
            />
          ))}
        </div>
      )}
    </div>
  );
});

DateGroup.displayName = 'DateGroup';

/**
 * Enhanced activity timeline with date grouping and Salesforce-style activity grouping
 * O(n) grouping complexity, O(1) per activity rendering
 */
const ActivityTimelineEnhanced = ({ leadId }) => {
  const {
    groupedActivities,
    loading,
    hasMore,
    activeFilter,
    stats,
    observerTarget,
    handleFilterChange
  } = useActivityTimeline(leadId);

  const [expandedDates, setExpandedDates] = useState(new Set());

  const dateGroupedActivities = useMemo(() => {
    return groupActivitiesByDate(groupedActivities);
  }, [groupedActivities]);

  useEffect(() => {
    if (dateGroupedActivities.length > 0 && expandedDates.size === 0) {
      setExpandedDates(new Set([dateGroupedActivities[0].date]));
    }
  }, [dateGroupedActivities]);

  const toggleDateGroup = (date) => {
    setExpandedDates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedDates(new Set(dateGroupedActivities.map(g => g.date)));
  };

  const collapseAll = () => {
    setExpandedDates(new Set());
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
          {stats.total > 0 && (
            <span className="text-sm text-gray-500">({stats.total} total)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {dateGroupedActivities.length > 1 && (
            <div className="flex gap-1">
              <button
                onClick={expandAll}
                className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
              >
                Collapse All
              </button>
            </div>
          )}
          <ActivityFilter 
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            stats={stats}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {groupedActivities.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mb-2 opacity-50" />
            <p>No activities found</p>
          </div>
        ) : (
          <div>
            {dateGroupedActivities.map((group) => (
              <DateGroup
                key={group.date}
                group={group}
                isExpanded={expandedDates.has(group.date)}
                onToggle={() => toggleDateGroup(group.date)}
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

export default ActivityTimelineEnhanced;
