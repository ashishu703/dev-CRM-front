import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../../utils/globalImports';

export const ACTIVITY_FILTERS = {
  ALL: 'all',
  MAILS: 'mails',
  FOLLOWUPS: 'followups',
  STATUS: 'status',
  DOCUMENTS: 'documents'
};

export const FILTER_TO_TYPES = {
  [ACTIVITY_FILTERS.MAILS]: ['mail_sent', 'mail_opened'],
  [ACTIVITY_FILTERS.FOLLOWUPS]: ['followup_scheduled', 'followup_done'],
  [ACTIVITY_FILTERS.STATUS]: ['status_changed', 'lead_assigned', 'lead_transferred'],
  [ACTIVITY_FILTERS.DOCUMENTS]: ['document_uploaded', 'quotation_created', 'rfp_raised']
};

/**
 * Group activities that happen within 30 seconds of each other
 * by the same user (Salesforce-style grouping)
 */
const groupActivitiesByTime = (activities) => {
  if (!activities || activities.length === 0) return [];

  const grouped = [];
  let currentGroup = [activities[0]];
  
  for (let i = 1; i < activities.length; i++) {
    const current = activities[i];
    const previous = activities[i - 1];
    
    const currentTime = new Date(current.created_at).getTime();
    const previousTime = new Date(previous.created_at).getTime();
    const timeDiff = Math.abs(previousTime - currentTime);
    
    // Group if within 30 seconds and same user
    if (timeDiff <= 30000 && current.performed_by === previous.performed_by) {
      currentGroup.push(current);
    } else {
      // Save current group and start new one
      grouped.push({
        id: `group-${grouped.length}`,
        activities: currentGroup,
        isGroup: currentGroup.length > 1
      });
      currentGroup = [current];
    }
  }
  
  // Don't forget the last group
  if (currentGroup.length > 0) {
    grouped.push({
      id: `group-${grouped.length}`,
      activities: currentGroup,
      isGroup: currentGroup.length > 1
    });
  }
  
  return grouped;
};

/**
 * Base hook for activity timeline functionality
 * Implements cursor-based pagination with O(1) complexity
 * DRY principle: Shared logic between ActivityTimeline and ActivityTimelineEnhanced
 */
export const useActivityTimeline = (leadId) => {
  const [activities, setActivities] = useState([]);
  const [groupedActivities, setGroupedActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(null);
  const [activeFilter, setActiveFilter] = useState(ACTIVITY_FILTERS.ALL);
  const [stats, setStats] = useState({});
  
  const observerTarget = useRef(null);
  const isInitialLoad = useRef(true);

  const fetchActivities = useCallback(async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '20'
      });
      
      if (!reset && cursor) {
        params.append('cursor', cursor);
      }
      
      if (activeFilter !== ACTIVITY_FILTERS.ALL) {
        const types = FILTER_TO_TYPES[activeFilter];
        types.forEach(type => params.append('activityType', type));
      }
      
      const response = await apiClient.get(
        `/api/lead-activities/${leadId}/timeline?${params.toString()}`
      );
      
      const newActivities = response.data || [];
      
      setActivities(prev => reset ? newActivities : [...prev, ...newActivities]);
      setCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  }, [leadId, cursor, hasMore, loading, activeFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get(`/api/lead-activities/${leadId}/stats`);
      setStats(response.data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [leadId]);

  // Group activities whenever they change
  useEffect(() => {
    const grouped = groupActivitiesByTime(activities);
    setGroupedActivities(grouped);
  }, [activities]);

  useEffect(() => {
    if (isInitialLoad.current) {
      fetchActivities(true);
      fetchStats();
      isInitialLoad.current = false;
    }
  }, []);

  useEffect(() => {
    if (!isInitialLoad.current) {
      setActivities([]);
      setCursor(null);
      setHasMore(true);
      fetchActivities(true);
    }
  }, [activeFilter]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchActivities();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, fetchActivities]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  return {
    activities,
    groupedActivities,
    loading,
    hasMore,
    activeFilter,
    stats,
    observerTarget,
    handleFilterChange
  };
};
