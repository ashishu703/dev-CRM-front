import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Clock, FilePlus2, RefreshCw, Trash2, XCircle, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../utils/apiClient';
import rfpService from '../../services/RfpService';
import productPriceService from '../../services/ProductPriceService';
import { getProducts } from '../../constants/products';
import Toast from '../../utils/Toast';

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

const PAGE_SIZE_OPTIONS = [25, 50, 100];

const RfpWorkflow = ({ setActiveView, onOpenCalculator }) => {
  const { user } = useAuth();
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [showAccountsSubmit, setShowAccountsSubmit] = useState(false);
  const [showAccountsApproval, setShowAccountsApproval] = useState(false);
  const [showSeniorApproval, setShowSeniorApproval] = useState(false);
  const [showOperations, setShowOperations] = useState(false);
  const [showPriceListModal, setShowPriceListModal] = useState(false);
  const [showRfpApprovalModal, setShowRfpApprovalModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRfp, setSelectedRfp] = useState(null);
  const [createForm, setCreateForm] = useState({
    leadId: '',
    productSpec: '3×16',
    quantity: '',
    deliveryTimeline: '',
    specialRequirements: '',
    availabilityStatus: 'not_in_stock'
  });
  const [priceForm, setPriceForm] = useState({
    rawMaterialPrice: '',
    processingCost: '',
    margin: '',
    validityDate: ''
  });
  const [accountsSubmitForm, setAccountsSubmitForm] = useState({
    piId: '',
    paymentId: ''
  });
  const [accountsApprovalForm, setAccountsApprovalForm] = useState({
    status: 'approved',
    notes: ''
  });
  const [seniorApprovalForm, setSeniorApprovalForm] = useState({
    status: 'approved',
    notes: ''
  });
  const [operationsForm, setOperationsForm] = useState({
    action: 'acknowledge',
    expectedOrderCreationDate: '',
    reason: ''
  });
  const [priceListForm, setPriceListForm] = useState({
    productSpec: '3×16',
    unitPrice: '',
    validUntil: ''
  });
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);

  const permissions = useMemo(() => {
    const dept = (user?.departmentType || '').toLowerCase();
    return {
      isSales: dept.includes('sales'),
      isAccounts: dept.includes('accounts'),
      isProduction: dept.includes('production'),
      isSuperAdmin: user?.role === 'superadmin',
      isDh: user?.role === 'department_head',
      isSalesperson: user?.role === 'department_user' && dept.includes('sales')
    };
  }, [user]);

  const columnCount = permissions.isProduction ? 8 : 9;

  const totalPages = useMemo(() => {
    if (!rfps.length) return 1;
    return Math.max(1, Math.ceil(rfps.length / pageSize));
  }, [rfps.length, pageSize]);

  const paginatedRfps = useMemo(() => {
    if (!rfps.length) return [];
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return rfps.slice(start, end);
  }, [rfps, page, pageSize, totalPages]);

  const handlePageChange = (nextPage) => {
    setPage((prev) => {
      const target = typeof nextPage === 'number' ? nextPage : prev + (nextPage === 'next' ? 1 : -1);
      const safe = Math.min(Math.max(1, target), totalPages);
      return safe;
    });
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setPage(1);
  };

  const openCalculatorForProduct = (rfp, productSpec, productMeta = {}) => {
    const spec = (productSpec || '').trim();
    if (!spec) return;
    const normalizedSpec = spec.toUpperCase();

    const baseContext = {
      productSpec: spec,
      rfpId: rfp.rfp_id || null,
      rfpRequestId: rfp.id,
      quantity: productMeta.quantity ?? rfp.quantity ?? null,
      length: productMeta.length ?? null,
      lengthUnit: productMeta.lengthUnit ?? null
    };

    const openCalculatorCb = onOpenCalculator || ((context) => {
      try {
        window.localStorage.setItem(
          'rfpCalculatorRequest',
          JSON.stringify(context)
        );
        window.sessionStorage.setItem('calculatorFromRfp', '1');
      } catch {
      }

      if (typeof setActiveView === 'function') {
        setActiveView('calculator');
      }
    });

    if (normalizedSpec.includes('AAAC')) {
      openCalculatorCb({ family: 'AAAC', ...baseContext });
      return;
    }
    if (normalizedSpec.includes('ACSR')) {
      openCalculatorCb({ family: 'ACSR', ...baseContext });
      return;
    }
    if (normalizedSpec.includes('AB CABLE') || normalizedSpec.includes('AERIAL BUNCHED')) {
      openCalculatorCb({ family: 'AB_CABLE', ...baseContext });
      return;
    }
    if (
      (normalizedSpec.includes('MULTI CORE') && normalizedSpec.includes('XLPE') && normalizedSpec.includes('ARMOURED')) ||
      (normalizedSpec.includes('XLPE') && normalizedSpec.includes('ALUMINIUM ARMOURED'))
    ) {
      openCalculatorCb({ family: 'MC_XLPE_ARMOURED', ...baseContext });
      return;
    }

    // Custom / unknown product: open AAAC or ACSR with isCustom so DH can use the Custom row
    if (normalizedSpec.includes('ACSR') || normalizedSpec.includes('STEEL') || normalizedSpec.includes('REINFORCED')) {
      openCalculatorCb({ family: 'ACSR', isCustom: true, ...baseContext });
      return;
    }
    openCalculatorCb({ family: 'AAAC', isCustom: true, ...baseContext });
  };

  const fetchRfps = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await rfpService.list();
      setRfps(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      setError(err.message || 'Failed to load RFPs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfps();
  }, []);

  // When returning from calculator after saving price: re-open approval modal with fresh RFP data so Approve enables when all priced
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('rfpApprovalReopen');
      if (!raw) return;
      const { rfpRequestId, at } = JSON.parse(raw);
      window.localStorage.removeItem('rfpApprovalReopen');
      if (!rfpRequestId || !at || Date.now() - at > 60000) return; // ignore if older than 60s
      rfpService
        .getById(rfpRequestId)
        .then((res) => {
          if (res.success && res.data) {
            const rfpData = res.data.rfp || res.data;
            setSelectedRfp(rfpData);
            setShowRfpApprovalModal(true);
            setRejectionReason('');
            setError('');
          }
        })
        .catch(() => {});
    } catch {
      try { window.localStorage.removeItem('rfpApprovalReopen'); } catch { /* ignore */ }
    }
  }, []);

  const openModal = (setter, rfp, resetFn) => {
    setSelectedRfp(rfp || null);
    if (resetFn) resetFn();
    setProducts(getProducts());
    setter(true);
  };

  const closeModals = () => {
    setShowCreate(false);
    setShowPrice(false);
    setShowAccountsSubmit(false);
    setShowAccountsApproval(false);
    setShowSeniorApproval(false);
    setShowOperations(false);
    setShowPriceListModal(false);
    setShowRfpApprovalModal(false);
    setSelectedRfp(null);
    setRejectionReason('');
  };

  const handleCreate = async () => {
    try {
      await rfpService.create({
        leadId: createForm.leadId,
        productSpec: createForm.productSpec,
        quantity: createForm.quantity,
        deliveryTimeline: createForm.deliveryTimeline,
        specialRequirements: createForm.specialRequirements,
        availabilityStatus: createForm.availabilityStatus
      });
      closeModals();
      fetchRfps();
    } catch (err) {
      setError(err.message || 'Failed to create RFP');
    }
  };

  const handleApprove = async (rfpId) => {
    try {
      let calculatorTotalPrice = null;
      let calculatorDetail = null;
      try {
        const raw = window.localStorage.getItem('rfpCalculatorResult');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.rfpId === selectedRfp?.rfp_id || parsed.rfpRequestId === selectedRfp?.id)) {
            calculatorTotalPrice = parsed.totalPrice ?? null;
            calculatorDetail = parsed;
          }
        }
      } catch {
      }

      const response = await rfpService.approve(rfpId, {
        calculatorTotalPrice,
        calculatorDetail,
      });
      fetchRfps();
      setShowRfpApprovalModal(false);
      setSelectedRfp(null);
      window.dispatchEvent(new CustomEvent('rfpRecordUpdated', { detail: { type: 'approved', rfpId: response?.data?.rfp_id } }))
    } catch (error) {
      setError(error.message || 'Failed to approve RFP');
    }
  };

  const handleReject = async (rfpId) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }
    try {
      await rfpService.reject(rfpId, rejectionReason);
      fetchRfps();
      setShowRfpApprovalModal(false);
      setSelectedRfp(null);
      setRejectionReason('');
    } catch (error) {
      setError(error.message || 'Failed to reject RFP');
    }
  };

  const openRfpApprovalModal = async (rfp) => {
    try {
      const response = await rfpService.getById(rfp.id);
      if (response.success && response.data) {
        const rfpData = response.data.rfp || response.data;
        setSelectedRfp(rfpData);
        setShowRfpApprovalModal(true);
        setRejectionReason('');
        setError('');
      }
    } catch (error) {
      setError(error.message || 'Failed to load RFP details');
    }
  };

  const allProductsPriced = useMemo(() => {
    if (!selectedRfp?.products?.length) return false;
    return selectedRfp.products.every((p) => {
      const price = p.target_price ?? p.targetPrice;
      if (price === undefined || price === null || price === '') return false;
      const n = Number(price);
      return Number.isFinite(n);
    });
  }, [selectedRfp?.products]);

  // Refetch RFP in approval modal when a calculator saves price (so target_price list stays current)
  useEffect(() => {
    const handler = (e) => {
      const rfpRequestId = e.detail?.rfpRequestId;
      if (!rfpRequestId) return;
      rfpService
        .getById(rfpRequestId)
        .then((res) => {
          if (res.success && res.data) {
            const rfpData = res.data.rfp || res.data;
            setSelectedRfp((prev) =>
              prev && String(prev.id) === String(rfpData.id) ? rfpData : prev
            );
          }
        })
        .catch(() => {});
    };
    window.addEventListener('rfpCalculatorPriceReady', handler);
    return () => window.removeEventListener('rfpCalculatorPriceReady', handler);
  }, []);

  // Pending calculator result from localStorage (before DH Approve) – so pricing shows after "Save & Return to RFP"
  const pendingCalculatorLog = (() => {
    if (!showRfpApprovalModal || !selectedRfp) return null;
    try {
      const raw = window.localStorage.getItem('rfpCalculatorResult');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed) return null;
      const matches =
        (parsed.rfpRequestId && String(parsed.rfpRequestId) === String(selectedRfp.id)) ||
        (parsed.rfpId && selectedRfp.rfp_id && String(parsed.rfpId) === String(selectedRfp.rfp_id));
      return matches ? parsed : null;
    } catch {
      return null;
    }
  })();

  const [clearingProductSpec, setClearingProductSpec] = useState(null);

  const handleClearProductPrice = async (rfpId, productSpec) => {
    if (!productSpec || !rfpId) return;
    if (!window.confirm('Remove this calculated price? You can recalculate using "Calculate Price".')) return;
    setClearingProductSpec(productSpec);
    setError('');
    try {
      await rfpService.clearProductCalculatorPrice(rfpId, { productSpec });
      const res = await rfpService.getById(rfpId);
      if (res.success && res.data) {
        const rfpData = res.data.rfp || res.data;
        setSelectedRfp(rfpData);
        Toast.success('Price removed. Use "Calculate Price" to set again.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to remove price');
      Toast.error(err?.message || 'Failed to remove price');
    } finally {
      setClearingProductSpec(null);
    }
  };

  const handlePriceUpdate = async () => {
    if (!selectedRfp) return;
    await rfpService.addPrice(selectedRfp.id, priceForm);
    closeModals();
    fetchRfps();
  };

  const handleGenerateQuotation = async (rfpId) => {
    await rfpService.generateQuotation(rfpId);
    fetchRfps();
  };

  const handleSubmitAccounts = async () => {
    if (!selectedRfp) return;
    await rfpService.submitToAccounts(selectedRfp.id, accountsSubmitForm);
    closeModals();
    fetchRfps();
  };

  const handleAccountsApproval = async () => {
    if (!selectedRfp) return;
    await rfpService.updateAccountsApproval(selectedRfp.id, accountsApprovalForm);
    closeModals();
    fetchRfps();
  };

  const handleSeniorApproval = async () => {
    if (!selectedRfp) return;
    await rfpService.updateSeniorApproval(selectedRfp.id, seniorApprovalForm);
    closeModals();
    fetchRfps();
  };

  const handleOperationsAction = async () => {
    if (!selectedRfp?.work_order_id) return;
    if (operationsForm.action === 'cancel' && !operationsForm.reason) {
      setError('Cancellation reason is required');
      return;
    }
    if (operationsForm.action === 'acknowledge') {
      await apiClient.post(`/api/work-orders/${selectedRfp.work_order_id}/acknowledge`, {
        expectedOrderCreationDate: operationsForm.expectedOrderCreationDate || null
      });
    } else {
      await apiClient.post(`/api/work-orders/${selectedRfp.work_order_id}/cancel`, {
        reason: operationsForm.reason
      });
    }
    closeModals();
    fetchRfps();
  };

  const handlePriceListSave = async () => {
    try {
      await productPriceService.createApprovedPrice({
        productSpec: priceListForm.productSpec,
        unitPrice: priceListForm.unitPrice,
        validUntil: priceListForm.validUntil || null
      });
      closeModals();
    } catch (err) {
      setError(err.message || 'Failed to update price list');
    }
  };

  const statusBadge = (status) => {
    const normalized = (status || '').toLowerCase();
    if (['approved', 'pricing_ready', 'quotation_created', 'accounts_approved', 'sent_to_operations', 'senior_approved'].includes(normalized)) {
      return 'bg-emerald-100 text-emerald-700';
    }
    if (['credit_case', 'senior_rejected', 'rejected'].includes(normalized)) {
      return 'bg-rose-100 text-rose-700';
    }
    return 'bg-amber-100 text-amber-700';
  };

  const statusLabel = (status) => {
    const normalized = (status || '').toLowerCase();
    const map = {
      pending_dh: 'Pending DH Approval',
      approved: 'Approved',
      rejected: 'Rejected',
      pricing_ready: 'Pricing Ready',
      quotation_created: 'Quotation Created',
      accounts_pending: 'Accounts Approval Pending',
      accounts_approved: 'Accounts Approved',
      credit_case: 'Credit Case',
      senior_approved: 'Senior Approved',
      senior_rejected: 'Senior Rejected',
      sent_to_operations: 'Sent to Operations'
    };
    return map[normalized] || status || 'Pending';
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">RFP Workflow</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchRfps}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          {permissions.isSalesperson && (
            <button
              onClick={() => openModal(setShowCreate, null, () => setCreateForm({
                leadId: '',
                productSpec: '3×16',
                quantity: '',
                deliveryTimeline: '',
                specialRequirements: '',
                availabilityStatus: 'not_in_stock'
              }))}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500"
            >
              <FilePlus2 className="w-4 h-4" />
              Raise RFP
            </button>
          )}
          {permissions.isAccounts && (
            <button
              onClick={() => {
                setPriceListForm({ productSpec: '3×16', unitPrice: '', validUntil: '' });
                setProducts(getProducts());
                setShowPriceListModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500"
            >
              Set Approved Price
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 pt-4 pb-3">
          <div className="text-xs text-slate-600">
            {!loading && rfps.length > 0 && (
              <>
                Showing{' '}
                <span className="font-semibold">
                  {(page - 1) * pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold">
                  {Math.min(page * pageSize, rfps.length)}
                </span>{' '}
                of{' '}
                <span className="font-semibold">
                  {rfps.length}
                </span>{' '}
                RFPs
              </>
            )}
            {!loading && rfps.length === 0 && 'No RFPs to display'}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <span>Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border border-slate-200 rounded-md px-2 py-1 text-xs bg-white"
              >
                {PAGE_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={page <= 1 || totalPages <= 1}
                className="px-2 py-1 text-xs border border-slate-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                «
              </button>
              <button
                type="button"
                onClick={() => handlePageChange('prev')}
                disabled={page <= 1 || totalPages <= 1}
                className="px-2 py-1 text-xs border border-slate-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                ‹
              </button>
              <span className="text-xs text-slate-600 px-1">
                Page <span className="font-semibold">{page}</span> of{' '}
                <span className="font-semibold">{totalPages}</span>
              </span>
              <button
                type="button"
                onClick={() => handlePageChange('next')}
                disabled={page >= totalPages || totalPages <= 1}
                className="px-2 py-1 text-xs border border-slate-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                ›
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(totalPages)}
                disabled={page >= totalPages || totalPages <= 1}
                className="px-2 py-1 text-xs border border-slate-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                »
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">RFP ID</th>
                <th className="px-4 py-3 text-left">Lead</th>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Qty</th>
                <th className="px-4 py-3 text-left">Status</th>
                {!permissions.isProduction && <th className="px-4 py-3 text-left">Price</th>}
                <th className="px-4 py-3 text-left">Quotation</th>
                <th className="px-4 py-3 text-left">Work Order</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={columnCount} className="px-4 py-6 text-center text-slate-500">Loading...</td>
                </tr>
              )}
              {!loading && rfps.length === 0 && (
                <tr>
                  <td colSpan={columnCount} className="px-4 py-6 text-center text-slate-500">No RFPs found.</td>
                </tr>
              )}
              {!loading && paginatedRfps.map((rfp) => (
                <tr key={rfp.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{rfp.rfp_id || 'Pending'}</td>
                  <td className="px-4 py-3 text-slate-700">LD-{rfp.lead_id}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {rfp.products && rfp.products.length > 0 ? (
                      <div className="space-y-1">
                        {rfp.products.slice(0, 2).map((p, idx) => (
                          <div key={idx} className="text-xs">
                            {p.product_spec} {p.quantity ? `(Qty: ${p.quantity})` : ''}
                          </div>
                        ))}
                        {rfp.products.length > 2 && (
                          <div className="text-xs text-slate-500">+{rfp.products.length - 2} more</div>
                        )}
                      </div>
                    ) : (
                      rfp.product_spec || 'N/A'
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {rfp.products && rfp.products.length > 0
                      ? rfp.products.reduce((sum, p) => sum + (parseFloat(p.length) || 0), 0).toFixed(2)
                      : (rfp.length || '-')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(rfp.status)}`}>
                      {statusLabel(rfp.status)}
                    </span>
                  </td>
                  {!permissions.isProduction && (
                    <td className="px-4 py-3 text-slate-700">
                      {rfp.calculator_total_price || rfp.calculated_price
                        ? formatCurrency(rfp.calculator_total_price || rfp.calculated_price)
                        : '—'}
                    </td>
                  )}
                  <td className="px-4 py-3 text-slate-700">{rfp.quotation_number || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{rfp.work_order_number || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {permissions.isDh && (
                        <button
                          onClick={() => openRfpApprovalModal(rfp)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md text-white ${
                            rfp.status === 'pending_dh'
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-slate-700 hover:bg-slate-800'
                          }`}
                        >
                          <FilePlus2 className="w-3 h-3" />
                          {rfp.status === 'pending_dh' ? 'Review & Approve' : 'View'}
                        </button>
                      )}
                      {permissions.isAccounts && ['approved', 'pricing_ready'].includes(rfp.status) && (
                        <button
                          onClick={() => openModal(setShowPrice, rfp, () => setPriceForm({
                            rawMaterialPrice: '',
                            processingCost: '',
                            margin: '',
                            validityDate: ''
                          }))}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-indigo-600 text-white"
                        >
                          <Clock className="w-3 h-3" />
                          Add Price
                        </button>
                      )}
                      {permissions.isSalesperson && rfp.status === 'pricing_ready' && !rfp.quotation_id && (
                        <button
                          onClick={() => handleGenerateQuotation(rfp.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-slate-900 text-white"
                        >
                          Generate Quote
                        </button>
                      )}
                      {permissions.isSalesperson && rfp.quotation_id && ['not_submitted', null, undefined, ''].includes(rfp.accounts_approval_status) && (
                        <button
                          onClick={() => openModal(setShowAccountsSubmit, rfp, () => setAccountsSubmitForm({ piId: '', paymentId: '' }))}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-amber-600 text-white"
                        >
                          Submit Accounts
                        </button>
                      )}
                      {permissions.isAccounts && rfp.accounts_approval_status === 'pending' && (
                        <button
                          onClick={() => openModal(setShowAccountsApproval, rfp, () => setAccountsApprovalForm({ status: 'approved', notes: '' }))}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-emerald-700 text-white"
                        >
                          Accounts Decision
                        </button>
                      )}
                      {permissions.isSuperAdmin && rfp.status === 'credit_case' && (
                        <button
                          onClick={() => openModal(setShowSeniorApproval, rfp, () => setSeniorApprovalForm({ status: 'approved', notes: '' }))}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-purple-700 text-white"
                        >
                          Senior Approval
                        </button>
                      )}
                      {permissions.isProduction && rfp.work_order_id && rfp.status === 'sent_to_operations' && (
                        <button
                          onClick={() => openModal(setShowOperations, rfp, () => setOperationsForm({
                            action: 'acknowledge',
                            expectedOrderCreationDate: '',
                            reason: ''
                          }))}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-slate-700 text-white"
                        >
                          Operations
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[120]">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-semibold">Raise RFP</h2>
            <div className="space-y-3">
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={createForm.availabilityStatus}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, availabilityStatus: e.target.value }))}
              >
                <option value="not_in_stock">Not in stock / Price not available</option>
                <option value="in_stock">In stock (use quotation)</option>
              </select>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Lead ID"
                value={createForm.leadId}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, leadId: e.target.value }))}
              />
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={createForm.productSpec}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, productSpec: e.target.value }))}
              >
                <option value="">Select Product</option>
                {products.map((product, index) => (
                  <option key={index} value={product.name}>
                    {product.name}
                  </option>
                ))}
              </select>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Quantity"
                value={createForm.quantity}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, quantity: e.target.value }))}
              />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Timeline (Required By Date)
                </label>
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Select delivery date"
                  value={createForm.deliveryTimeline}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, deliveryTimeline: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                />
                {createForm.deliveryTimeline && (
                  <p className="mt-1 text-xs text-gray-500">
                    Delivery required by: {new Date(createForm.deliveryTimeline).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
              <textarea
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Special Requirements"
                rows={3}
                value={createForm.specialRequirements}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, specialRequirements: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={closeModals} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={createForm.availabilityStatus === 'in_stock'}
                className={`px-4 py-2 text-sm text-white rounded-lg ${createForm.availabilityStatus === 'in_stock' ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600'}`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrice && selectedRfp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[120]">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-semibold">Add Pricing</h2>
            <div className="grid grid-cols-2 gap-3">
              <input
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Raw Material Price"
                value={priceForm.rawMaterialPrice}
                onChange={(e) => setPriceForm((prev) => ({ ...prev, rawMaterialPrice: e.target.value }))}
              />
              <input
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Processing Cost"
                value={priceForm.processingCost}
                onChange={(e) => setPriceForm((prev) => ({ ...prev, processingCost: e.target.value }))}
              />
              <input
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Margin"
                value={priceForm.margin}
                onChange={(e) => setPriceForm((prev) => ({ ...prev, margin: e.target.value }))}
              />
              <input
                type="date"
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={priceForm.validityDate}
                onChange={(e) => setPriceForm((prev) => ({ ...prev, validityDate: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={closeModals} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button onClick={handlePriceUpdate} className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {showAccountsSubmit && selectedRfp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[120]">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-semibold">Submit to Accounts</h2>
            <div className="space-y-3">
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="PI ID (optional)"
                value={accountsSubmitForm.piId}
                onChange={(e) => setAccountsSubmitForm((prev) => ({ ...prev, piId: e.target.value }))}
              />
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Payment ID (optional)"
                value={accountsSubmitForm.paymentId}
                onChange={(e) => setAccountsSubmitForm((prev) => ({ ...prev, paymentId: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={closeModals} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button onClick={handleSubmitAccounts} className="px-4 py-2 text-sm text-white bg-amber-600 rounded-lg">Submit</button>
            </div>
          </div>
        </div>
      )}

      {showAccountsApproval && selectedRfp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[120]">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-semibold">Accounts Decision</h2>
            <div className="space-y-3">
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={accountsApprovalForm.status}
                onChange={(e) => setAccountsApprovalForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="approved">Approved</option>
                <option value="credit_case">Credit Case</option>
              </select>
              <textarea
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                rows={3}
                placeholder="Notes"
                value={accountsApprovalForm.notes}
                onChange={(e) => setAccountsApprovalForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={closeModals} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button onClick={handleAccountsApproval} className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg">Submit</button>
            </div>
          </div>
        </div>
      )}

      {showSeniorApproval && selectedRfp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[120]">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-semibold">Senior Management Decision</h2>
            <div className="space-y-3">
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={seniorApprovalForm.status}
                onChange={(e) => setSeniorApprovalForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <textarea
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                rows={3}
                placeholder="Notes"
                value={seniorApprovalForm.notes}
                onChange={(e) => setSeniorApprovalForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={closeModals} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button onClick={handleSeniorApproval} className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg">Submit</button>
            </div>
          </div>
        </div>
      )}

      {showOperations && selectedRfp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[120]">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-semibold">Operations Action</h2>
            <div className="space-y-3">
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={operationsForm.action}
                onChange={(e) => setOperationsForm((prev) => ({ ...prev, action: e.target.value }))}
              >
                <option value="acknowledge">Acknowledge</option>
                <option value="cancel">Cancel</option>
              </select>
              {operationsForm.action === 'acknowledge' ? (
                <input
                  type="date"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  value={operationsForm.expectedOrderCreationDate}
                  onChange={(e) => setOperationsForm((prev) => ({ ...prev, expectedOrderCreationDate: e.target.value }))}
                />
              ) : (
                <textarea
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Cancellation reason"
                  value={operationsForm.reason}
                  onChange={(e) => setOperationsForm((prev) => ({ ...prev, reason: e.target.value }))}
                />
              )}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={closeModals} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button onClick={handleOperationsAction} className="px-4 py-2 text-sm text-white bg-slate-900 rounded-lg">Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Department Head RFP Approval Modal - Comprehensive View */}
      {showRfpApprovalModal && selectedRfp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[120] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">RFP Approval</h2>
                  <p className="text-blue-100 text-sm">Review all products and approve or reject this RFP</p>
                </div>
                <button
                  onClick={closeModals}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Pricing progress summary */}
              {selectedRfp.products?.length > 0 && (() => {
                const priced = selectedRfp.products.filter(
                  (p) => p.target_price != null && p.target_price !== '' && Number.isFinite(Number(p.target_price))
                ).length;
                const total = selectedRfp.products.reduce(
                  (sum, p) => sum + (Number(p.target_price) || 0),
                  0
                );
                return (
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                    <span className="text-sm font-semibold text-emerald-800">
                      {priced} of {selectedRfp.products.length} product(s) priced
                    </span>
                    {priced > 0 && (
                      <span className="text-sm font-bold text-emerald-900">
                        Total calculated: {formatCurrency(total)}
                      </span>
                    )}
                  </div>
                );
              })()}

              {/* RFP Summary Section */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FilePlus2 className="w-5 h-5" />
                  RFP Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">RFP ID</label>
                    <p className="text-sm font-mono font-bold text-slate-900 mt-1">
                      {selectedRfp.rfp_id || 'Pending'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Raised By</label>
                    <p className="text-sm text-slate-900 mt-1">{selectedRfp.created_by || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Department</label>
                    <p className="text-sm text-slate-900 mt-1">{selectedRfp.department_type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Date</label>
                    <p className="text-sm text-slate-900 mt-1">
                      {selectedRfp.created_at 
                        ? new Date(selectedRfp.created_at).toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Lead</label>
                    <p className="text-sm text-slate-900 mt-1">
                      {selectedRfp.customer_name || `LD-${selectedRfp.lead_id}`}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Products</label>
                    <p className="text-sm font-bold text-blue-600 mt-1">
                      {selectedRfp.products?.length || 0}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Quantity</label>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {selectedRfp.products?.reduce((sum, p) => sum + (parseFloat(p.quantity) || 0), 0).toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Delivery Timeline</label>
                    <p className="text-sm text-slate-900 mt-1">
                      {selectedRfp.delivery_timeline 
                        ? new Date(selectedRfp.delivery_timeline).toLocaleDateString('en-IN')
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Products Table Section */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <h3 className="text-lg font-bold text-slate-900 mb-4 px-1">Products in this RFP</h3>
                {selectedRfp.products && selectedRfp.products.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px]">
                      <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">#</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Product Specification</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Length</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedRfp.products.map((product, index) => (
                          <tr key={product.id || index} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm text-slate-700 font-medium">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-slate-900">{product.product_spec || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {product.quantity ? product.quantity : '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {product.length ? `${product.length} ${product.length_unit || 'Mtr'}` : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {product.target_price != null && Number.isFinite(Number(product.target_price))
                                ? <span className="font-semibold text-emerald-700">{formatCurrency(product.target_price)}</span>
                                : <span className="text-slate-500">N/A</span>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                product.availability_status === 'custom_product_pricing_needed' 
                                  ? 'bg-purple-100 text-purple-800'
                                  : product.availability_status === 'in_stock_price_unavailable'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {product.availability_status?.replace(/_/g, ' ') || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openCalculatorForProduct(selectedRfp, product.product_spec, {
                                      quantity: product.quantity,
                                      length: product.length
                                    })
                                  }
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  <Clock className="w-3 h-3" />
                                  Calculate Price
                                </button>
                                {(product.target_price != null && product.target_price !== '' && Number.isFinite(Number(product.target_price))) ||
                                (product.calculator_log && typeof product.calculator_log === 'object') ? (
                                  <button
                                    type="button"
                                    onClick={() => handleClearProductPrice(selectedRfp.id, product.product_spec)}
                                    disabled={clearingProductSpec === product.product_spec}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:opacity-50"
                                    title="Remove calculated price"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    {clearingProductSpec === product.product_spec ? 'Removing…' : 'Remove price'}
                                  </button>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                    No products found in this RFP
                  </div>
                )}
              </div>

              {/* Per-product Pricing Log: scrollable list of calculated prices with details (up to 10 products) */}
              {selectedRfp.products && selectedRfp.products.length > 0 && (() => {
                const rateTypeLabelMap = {
                  alu_per_mtr: 'Aluminium / Mtr',
                  alloy_per_mtr: 'Alloy / Mtr',
                  alu_per_kg: 'Aluminium / Kg',
                  alloy_per_kg: 'Alloy / Kg',
                  isi_per_mtr: 'ISI / Mtr',
                  comm_per_mtr: 'COMM / Mtr',
                  isi_per_kg: 'ISI / Kg',
                  comm_per_kg: 'COMM / Kg',
                  ISI: 'ISI',
                  'COMM-1': 'COMM-1',
                  'COMM-2': 'COMM-2',
                  'COMM-3': 'COMM-3'
                };
                const productSpecMatch = (a, b) =>
                  a && b && String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
                const familyLabelMap = {
                  AAAC: 'AAAC',
                  ACSR: 'ACSR',
                  AB_CABLE: 'Aerial Bunched Cable',
                  MC_XLPE_ARMOURED: 'Multi Core XLPE Armoured'
                };
                const itemsWithLog = selectedRfp.products
                  .map((product) => {
                    const log =
                      product.calculator_log &&
                      (typeof product.calculator_log === 'object' ? product.calculator_log : null) ||
                      (pendingCalculatorLog && productSpecMatch(pendingCalculatorLog.productSpec, product.product_spec) ? pendingCalculatorLog : null);
                    const hasPrice =
                      (product.target_price != null && product.target_price !== '' && Number.isFinite(Number(product.target_price))) ||
                      (log && (log.totalPrice != null || log.totalPrice === 0));
                    return { product, log, hasPrice };
                  })
                  .filter(({ hasPrice }) => hasPrice);
                if (itemsWithLog.length === 0) return null;
                const specDiff = (a, b) => a && b && String(a).trim().toLowerCase() !== String(b).trim().toLowerCase();
                return (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-base font-bold text-slate-900 mb-3">Calculator details — {itemsWithLog.length} product(s) calculated</h3>
                    <p className="text-xs text-slate-600 mb-4">Inputs used and result for each product (Save &amp; Return from calculator)</p>
                    <div className="max-h-[400px] overflow-y-auto space-y-5 pr-1" style={{ scrollBehavior: 'smooth' }}>
                      {itemsWithLog.map(({ product, log }, idx) => {
                        const detail = log || {};
                        const lengthUsed =
                          detail.length !== undefined && detail.length !== null
                            ? detail.length
                            : (detail.quantity !== undefined && detail.quantity !== null ? detail.quantity : (product.length ?? '—'));
                        const totalDisplay = detail.totalPrice != null || detail.totalPrice === 0
                          ? formatCurrency(detail.totalPrice)
                          : (product.target_price != null ? formatCurrency(product.target_price) : '—');
                        const calculatedSpec = detail.productSpec || product.product_spec;
                        const rfpSpec = product.product_spec;
                        const isVariantMismatch = specDiff(calculatedSpec, rfpSpec);
                        return (
                          <div key={product.id || idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200">
                              <div>
                                <span className="text-sm font-bold text-slate-900">
                                  RFP line: {product.product_spec || 'Product'}
                                </span>
                                {isVariantMismatch && calculatedSpec && (
                                  <p className="text-xs text-amber-700 mt-1 font-medium">
                                    Updated / calculated for: {calculatedSpec}
                                  </p>
                                )}
                              </div>
                              <span className="text-lg font-bold text-emerald-700">{totalDisplay}</span>
                            </div>
                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Inputs used</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-800 mb-4">
                              <div>
                                <span className="text-slate-500">Length / Qty used:</span>{' '}
                                <span className="font-medium">{lengthUsed}</span>
                              </div>
                              {detail.family === 'MC_XLPE_ARMOURED' ? (
                                <div>
                                  <span className="text-slate-500">Selected specification:</span>{' '}
                                  <span className="font-medium">{detail.selectedSpec || '—'}</span>
                                </div>
                              ) : (
                                <div>
                                  <span className="text-slate-500">Rate type:</span>{' '}
                                  <span className="font-medium">{detail.rateType ? (rateTypeLabelMap[detail.rateType] || detail.rateType) : '—'}</span>
                                </div>
                              )}
                              <div>
                                <span className="text-slate-500">Family:</span>{' '}
                                <span className="font-medium">{detail.family ? (familyLabelMap[detail.family] || detail.family) : '—'}</span>
                              </div>
                              <div>
                                <span className="text-slate-500">Base (per unit):</span>{' '}
                                <span className="font-medium">
                                  {detail.basePerUnit != null ? formatCurrency(detail.basePerUnit) : (detail.basePerMtr != null ? formatCurrency(detail.basePerMtr) : '—')}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">Base amount:</span>{' '}
                                <span className="font-medium">{detail.baseTotal != null ? formatCurrency(detail.baseTotal) : '—'}</span>
                              </div>
                              {Array.isArray(detail.extraCharges) && detail.extraCharges.length > 0 && (
                                <div className="sm:col-span-2">
                                  <span className="text-slate-500">Additional charges:</span>
                                  <ul className="mt-1 text-slate-700 list-disc list-inside space-y-0.5">
                                    {detail.extraCharges.map((row, i) => (
                                      <li key={i}>{(row.label || 'Charge')} – {row.amount != null ? formatCurrency(row.amount) : '₹0.00'}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <div className="pt-2 border-t border-slate-100">
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Result</span>
                              <p className="text-base font-bold text-emerald-700 mt-1">Total: {totalDisplay}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Special Requirements */}
              {selectedRfp.special_requirements && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Special Requirements</h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedRfp.special_requirements}</p>
                  </div>
                </div>
              )}

              {/* Rejection Reason Input (shown when rejecting) */}
              <div className="border-t border-slate-200 pt-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Rejection Reason (Required if rejecting)
                </label>
                <textarea
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Please provide a reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-700 text-sm">
                  {error}
                </div>
              )}

              {!allProductsPriced && selectedRfp?.products?.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-sm">
                  Approve is allowed only when every product has a calculated price showing here. Use &quot;Calculate Price&quot; for each product so the price appears in this table, then Approve will enable.
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={closeModals}
                  className="px-6 py-2.5 text-sm font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedRfp.id)}
                  disabled={!rejectionReason.trim()}
                  className="px-6 py-2.5 text-sm font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject RFP
                </button>
                <button
                  onClick={() => handleApprove(selectedRfp.id)}
                  disabled={!allProductsPriced}
                  className="px-6 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve RFP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPriceListModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[120]">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-semibold">Set Approved Price</h2>
            <div className="space-y-3">
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={priceListForm.productSpec}
                onChange={(e) => setPriceListForm((prev) => ({ ...prev, productSpec: e.target.value }))}
              >
                <option value="">Select Product</option>
                {products.map((product, index) => (
                  <option key={index} value={product.name}>
                    {product.name}
                  </option>
                ))}
              </select>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Unit Price"
                value={priceListForm.unitPrice}
                onChange={(e) => setPriceListForm((prev) => ({ ...prev, unitPrice: e.target.value }))}
              />
              <input
                type="date"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={priceListForm.validUntil}
                onChange={(e) => setPriceListForm((prev) => ({ ...prev, validUntil: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={closeModals} className="px-4 py-2 text-sm border rounded-lg">Cancel</button>
              <button onClick={handlePriceListSave} className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RfpWorkflow;
