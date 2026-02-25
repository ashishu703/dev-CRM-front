'use strict';

import { useMemo } from 'react';
import { createSelector } from '@reduxjs/toolkit';

export function getUsersMapById(users) {
  const list = Array.isArray(users) ? users : [];
  const map = new Map();
  list.forEach((u) => {
    const id = u?.id ?? u?.userId;
    if (id) map.set(id, u);
  });
  return map;
}

export const selectUsersMapById = createSelector(
  [(users) => (Array.isArray(users) ? users : [])],
  (users) => getUsersMapById(users)
);

export function useUsersMapById(users) {
  return useMemo(() => getUsersMapById(users), [users]);
}

export function selectUserById(users, id) {
  if (!id || !Array.isArray(users)) return null;
  return users.find((u) => (u?.id ?? u?.userId) === id) ?? null;
}

export function selectTargetSummaryFromUser(user) {
  if (!user) return { totalTarget: 0, achieved: 0, remaining: 0, progressPct: 0 };
  const target = Number(user.target) || 0;
  const achieved = Number(user.achieved_target ?? user.achievedTarget) || 0;
  const remaining = Math.max(0, target - achieved);
  const progressPct = target > 0 ? (achieved / target) * 100 : 0;
  return { totalTarget: target, achieved, remaining, progressPct };
}

function mapUserToTargetRow(u) {
  const target = Number(u.target) || 0;
  const achieved = Number(u.achieved_target ?? u.achievedTarget) || 0;
  const remaining = Math.max(0, target - achieved);
  const progressPct = target > 0 ? (achieved / target) * 100 : 0;
  return {
    salespersonName: u.username || u.email || 'N/A',
    id: u.id,
    target,
    achieved,
    remaining,
    progressPct,
  };
}

export const selectTargetListFromUsers = createSelector(
  [(users) => (Array.isArray(users) ? users : [])],
  (users) => users.map(mapUserToTargetRow)
);

export function selectTargetListFromUsersUnmemoized(users) {
  return (Array.isArray(users) ? users : []).map(mapUserToTargetRow);
}
