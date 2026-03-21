import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../../utils/globalImports';
import {
  mergeHistoryIntoActivities,
  normalizeLeadHistoryRows,
} from '../../utils/leadHistoryAsActivities';

export const ACTIVITY_FILTERS = {
  ALL: 'all',
  MAILS: 'mails',
  FOLLOWUPS: 'followups',
  STATUS: 'status',
  DOCUMENTS: 'documents'
};

/** DB-backed types only — sent as query params to lead-activities/timeline */
const SERVER_FILTER_TYPES = {
  [ACTIVITY_FILTERS.MAILS]: ['mail_sent', 'mail_opened'],
  [ACTIVITY_FILTERS.FOLLOWUPS]: [
    'followup_scheduled',
    'followup_done',
    'followup_status_changed'
  ],
  [ACTIVITY_FILTERS.STATUS]: [
    'status_changed',
    'lead_assigned',
    'lead_transferred',
    'sales_status_changed'
  ],
  [ACTIVITY_FILTERS.DOCUMENTS]: ['document_uploaded', 'quotation_created', 'rfp_raised']
};

/** Includes synthetic followup_history_entry for filter counts / client merge behaviour */
export const FILTER_TO_TYPES = {
  [ACTIVITY_FILTERS.MAILS]: SERVER_FILTER_TYPES[ACTIVITY_FILTERS.MAILS],
  [ACTIVITY_FILTERS.FOLLOWUPS]: [
    ...SERVER_FILTER_TYPES[ACTIVITY_FILTERS.FOLLOWUPS],
    'followup_history_entry'
  ],
  [ACTIVITY_FILTERS.STATUS]: [
    ...SERVER_FILTER_TYPES[ACTIVITY_FILTERS.STATUS],
    'followup_history_entry'
  ],
  [ACTIVITY_FILTERS.DOCUMENTS]: SERVER_FILTER_TYPES[ACTIVITY_FILTERS.DOCUMENTS]
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
    
    if (timeDiff <= 30000 && current.performed_by === previous.performed_by) {
      currentGroup.push(current);
    } else {
      grouped.push({
        id: `group-${grouped.length}`,
        activities: currentGroup,
        isGroup: currentGroup.length > 1
      });
      currentGroup = [current];
    }
  }
  
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
 * Merges salesperson_lead_history into the feed when lead_activities is sparse (local / legacy data).
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
  const loadingRef = useRef(false);
  const timelineAccumRef = useRef([]);
  const historyCacheRef = useRef({ leadId: null, rows: null });

  const fetchHistoryCached = useCallback(async (lid) => {
    if (!lid) return [];
    if (historyCacheRef.current.leadId === lid && historyCacheRef.current.rows !== null) {
      return historyCacheRef.current.rows;
    }
    try {
      const res = await apiClient.get(
        `/api/leads/assigned/salesperson/lead/${lid}/history?limit=500&page=1`
      );
      const rows = normalizeLeadHistoryRows(res);
      historyCacheRef.current = { leadId: lid, rows };
      return rows;
    } catch {
      historyCacheRef.current = { leadId: lid, rows: [] };
      return [];
    }
  }, []);

  const fetchActivities = useCallback(async (reset = false) => {
    if (!leadId) return;
    if (loadingRef.current) return;
    if (!reset && !hasMore) return;

    loadingRef.current = true;
    setLoading(true);
    try {
      const histRows = await fetchHistoryCached(leadId);

      const params = new URLSearchParams({
        limit: '20'
      });

      const useCursor = reset ? null : cursor;
      if (useCursor) {
        params.append('cursor', useCursor);
      }

      if (activeFilter !== ACTIVITY_FILTERS.ALL) {
        const types = SERVER_FILTER_TYPES[activeFilter];
        (types || []).forEach((type) => params.append('activityType', type));
      }

      const response = await apiClient.get(
        `/api/lead-activities/${leadId}/timeline?${params.toString()}`
      );

      const newActivities = response.data || [];

      if (reset) {
        timelineAccumRef.current = newActivities;
      } else {
        timelineAccumRef.current = [...timelineAccumRef.current, ...newActivities];
      }

      const merged = mergeHistoryIntoActivities(
        timelineAccumRef.current,
        histRows,
        activeFilter
      );
      setActivities(merged);
      setCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [leadId, cursor, hasMore, activeFilter, fetchHistoryCached]);

  const fetchStats = useCallback(async () => {
    if (!leadId) return;
    try {
      const [response, histRows] = await Promise.all([
        apiClient.get(`/api/lead-activities/${leadId}/stats`),
        fetchHistoryCached(leadId)
      ]);
      const base = response.data || {};
      const apiTotal = response.total ?? 0;
      const histCount = histRows.length;
      setStats({
        ...base,
        total: apiTotal + histCount,
        followup_history_entry: histCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [leadId, fetchHistoryCached]);

  useEffect(() => {
    const grouped = groupActivitiesByTime(activities);
    setGroupedActivities(grouped);
  }, [activities]);

  useEffect(() => {
    historyCacheRef.current = { leadId: null, rows: null };
    timelineAccumRef.current = [];
    setActivities([]);
    setCursor(null);
    setHasMore(true);
    if (!leadId) return;
    fetchActivities(true);
    fetchStats();
    // fetchActivities / fetchStats intentionally omitted: reset load when leadId or filter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId, activeFilter]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          fetchActivities(false);
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
  }, [hasMore, fetchActivities]);

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
