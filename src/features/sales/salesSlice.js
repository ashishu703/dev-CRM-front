import { createSlice, createAsyncThunk, createEntityAdapter } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { API_ENDPOINTS } from '../../api/admin_api/api';
import departmentUsersApi from '../../api/admin_api/departmentUsersApi';
import salesDataService from '../../services/SalesDataService';

const leadsAdapter = createEntityAdapter({
  selectId: (lead) => lead.id,
  sortComparer: (a, b) => (b.created_at || '').localeCompare(a.created_at || ''),
});

export const fetchLeadsSalesperson = createAsyncThunk(
  'sales/fetchLeadsSalesperson',
  async (_, { rejectWithValue }) => {
    try {
      const url = `${API_ENDPOINTS.SALESPERSON_ASSIGNED_LEADS_ME()}?_t=${Date.now()}`;
      const response = await apiClient.get(url);
      const assignedLeads = response?.data || [];
      return assignedLeads.map((lead) => ({
        id: lead.id,
        name: lead.name,
        sales_status: lead.sales_status || lead.salesStatus || 'pending',
        source: lead.lead_source || lead.leadSource || 'Unknown',
        created_at: lead.created_at || lead.createdAt || lead.date || new Date().toISOString(),
        follow_up_date: lead.follow_up_date || lead.followUpDate || null,
        lead_priority: (lead.lead_priority || lead.leadPriority || 'LOW').toUpperCase(),
      }));
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to load leads');
    }
  }
);

export const fetchLeadsDepartmentHead = createAsyncThunk(
  'sales/fetchLeadsDepartmentHead',
  async (departmentType, { rejectWithValue }) => {
    try {
      const dept = departmentType || 'office_sales';
      const allLeads = await salesDataService.fetchAllLeads(dept);
      return allLeads.map((lead) => ({
        id: lead.id,
        name: lead.customer || lead.name,
        sales_status: lead.sales_status || lead.salesStatus || 'pending',
        follow_up_status: lead.follow_up_status || lead.followUpStatus || '',
        source: lead.lead_source || lead.leadSource || 'Unknown',
        created_at: lead.created_at || lead.createdAt || lead.date || new Date().toISOString(),
        assigned_salesperson: lead.assigned_salesperson || lead.assignedSalesperson || '',
      }));
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to load leads');
    }
  }
);

export const fetchUserTarget = createAsyncThunk(
  'sales/fetchUserTarget',
  async (payload, { rejectWithValue }) => {
    try {
      const { role, userId } = payload || {};
      if (role === 'department_head' && userId) {
        const departmentHeadService = (await import('../../api/admin_api/departmentHeadService')).default;
        const response = await departmentHeadService.getHeadById(userId);
        const headData = response?.data?.user || response?.user || response?.data || response;
        if (!headData) {
          return { target: 0, achievedTarget: 0, targetStartDate: null, targetEndDate: null, targetDurationDays: null };
        }
        return {
          target: parseFloat(headData.target || 0),
          achievedTarget: parseFloat(headData.achievedTarget ?? headData.achieved_target ?? 0),
          targetStartDate: headData.targetStartDate ?? headData.target_start_date ?? null,
          targetEndDate: headData.targetEndDate ?? headData.target_end_date ?? null,
          targetDurationDays: headData.targetDurationDays ?? headData.target_duration_days ?? null,
        };
      }
      const payloadData = await departmentUsersApi.listUsers({ page: 1, limit: 1 });
      const users = payloadData?.users || [];
      if (users.length === 0) {
        return { target: 0, achievedTarget: 0, targetStartDate: null, targetEndDate: null, targetDurationDays: null };
      }
      const user = users[0];
      return {
        target: parseFloat(user.target || 0),
        achievedTarget: parseFloat(user.achievedTarget ?? user.achieved_target ?? 0),
        targetStartDate: user.targetStartDate ?? user.target_start_date ?? null,
        targetEndDate: user.targetEndDate ?? user.target_end_date ?? null,
        targetDurationDays: user.targetDurationDays ?? user.target_duration_days ?? null,
      };
    } catch (err) {
      return rejectWithValue(err?.message || 'Failed to fetch target');
    }
  }
);

const initialState = {
  leads: leadsAdapter.getInitialState({ ids: [], entities: {} }),
  userTarget: {
    target: 0,
    achievedTarget: 0,
    targetStartDate: null,
    targetEndDate: null,
    targetDurationDays: null,
  },
  businessMetrics: {
    totalQuotation: 0,
    approvedQuotation: 0,
    pendingQuotation: 0,
    rejectedQuotation: 0,
    totalPI: 0,
    approvedPI: 0,
    pendingPI: 0,
    rejectedPI: 0,
    totalAdvancePayment: 0,
    duePayment: 0,
    totalSaleOrder: 0,
    totalReceivedPayment: 0,
    totalRevenue: 0,
  },
  chartData: {
    allPayments: [],
    allQuotations: [],
    allPIs: [],
  },
  loading: { leads: false, target: false },
  error: { leads: null, target: null },
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setUserTarget: (state, { payload }) => {
      state.userTarget = payload ?? initialState.userTarget;
    },
    setBusinessMetrics: (state, { payload }) => {
      state.businessMetrics = { ...initialState.businessMetrics, ...payload };
    },
    setChartData: (state, { payload }) => {
      if (payload) {
        state.chartData.allPayments = payload.allPayments ?? state.chartData.allPayments;
        state.chartData.allQuotations = payload.allQuotations ?? state.chartData.allQuotations;
        state.chartData.allPIs = payload.allPIs ?? state.chartData.allPIs;
      }
    },
    clearLeadsError: (state) => {
      state.error.leads = null;
    },
    clearSalesState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeadsSalesperson.pending, (state) => {
        state.loading.leads = true;
        state.error.leads = null;
      })
      .addCase(fetchLeadsSalesperson.fulfilled, (state, { payload }) => {
        state.loading.leads = false;
        leadsAdapter.setAll(state.leads, payload ?? []);
      })
      .addCase(fetchLeadsSalesperson.rejected, (state, { payload }) => {
        state.loading.leads = false;
        state.error.leads = payload ?? 'Failed to load leads';
        leadsAdapter.setAll(state.leads, []);
      })
      .addCase(fetchLeadsDepartmentHead.pending, (state) => {
        state.loading.leads = true;
        state.error.leads = null;
      })
      .addCase(fetchLeadsDepartmentHead.fulfilled, (state, { payload }) => {
        state.loading.leads = false;
        leadsAdapter.setAll(state.leads, payload ?? []);
      })
      .addCase(fetchLeadsDepartmentHead.rejected, (state, { payload }) => {
        state.loading.leads = false;
        state.error.leads = payload ?? 'Failed to load leads';
        leadsAdapter.setAll(state.leads, []);
      })
      .addCase(fetchUserTarget.pending, (state) => {
        state.loading.target = true;
        state.error.target = null;
      })
      .addCase(fetchUserTarget.fulfilled, (state, { payload }) => {
        state.loading.target = false;
        state.userTarget = payload ?? initialState.userTarget;
      })
      .addCase(fetchUserTarget.rejected, (state, { payload }) => {
        state.loading.target = false;
        state.error.target = payload ?? 'Failed to fetch target';
      });
  },
});

export const { setUserTarget, setBusinessMetrics, setChartData, clearLeadsError, clearSalesState } = salesSlice.actions;
export const salesReducer = salesSlice.reducer;
export { leadsAdapter };
