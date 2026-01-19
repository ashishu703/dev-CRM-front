import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Clock, FilePlus2, RefreshCw, XCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../utils/apiClient';
import rfpService from '../../services/RfpService';
import productPriceService from '../../services/ProductPriceService';

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

const RfpWorkflow = () => {
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

  const openModal = (setter, rfp, resetFn) => {
    setSelectedRfp(rfp || null);
    if (resetFn) resetFn();
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
    setSelectedRfp(null);
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
    await rfpService.approve(rfpId);
    fetchRfps();
  };

  const handleReject = async (rfpId) => {
    const reason = window.prompt('Rejection reason?');
    if (!reason) return;
    await rfpService.reject(rfpId, reason);
    fetchRfps();
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
          <p className="text-xs uppercase tracking-wide text-slate-500">RFP Workflow</p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Pricing → Quotation → Work Order</h1>
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
              {!loading && rfps.map((rfp) => (
                <tr key={rfp.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{rfp.rfp_id || 'Pending'}</td>
                  <td className="px-4 py-3 text-slate-700">LD-{rfp.lead_id}</td>
                  <td className="px-4 py-3 text-slate-700">{rfp.product_spec}</td>
                  <td className="px-4 py-3 text-slate-700">{rfp.quantity || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge(rfp.status)}`}>
                      {statusLabel(rfp.status)}
                    </span>
                  </td>
                  {!permissions.isProduction && (
                    <td className="px-4 py-3 text-slate-700">
                      {rfp.calculated_price ? formatCurrency(rfp.calculated_price) : '—'}
                    </td>
                  )}
                  <td className="px-4 py-3 text-slate-700">{rfp.quotation_number || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{rfp.work_order_number || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {permissions.isDh && rfp.status === 'pending_dh' && (
                        <>
                          <button
                            onClick={() => handleApprove(rfp.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-emerald-600 text-white"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(rfp.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-rose-600 text-white"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                        </>
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
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Product Spec"
                value={createForm.productSpec}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, productSpec: e.target.value }))}
              />
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Quantity"
                value={createForm.quantity}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, quantity: e.target.value }))}
              />
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Delivery Timeline"
                value={createForm.deliveryTimeline}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, deliveryTimeline: e.target.value }))}
              />
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

      {showPriceListModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[120]">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-semibold">Set Approved Price</h2>
            <div className="space-y-3">
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Product Spec"
                value={priceListForm.productSpec}
                onChange={(e) => setPriceListForm((prev) => ({ ...prev, productSpec: e.target.value }))}
              />
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
