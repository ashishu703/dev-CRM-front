/**
 * Injects commonly-used RFP identifiers into an HTML template context.
 *
 * Supports:
 * - {{rfpId}} / {{masterRfpId}} (new)
 * - {{rfp_requests.id}} / {{rfp_requests.rfp_id}} (legacy compatibility)
 *
 * Resolution order:
 * 1) explicit fields on provided context (rfpId/rfp_id/masterRfpId/master_rfp_id)
 * 2) optional candidate values (strings)
 * 3) sessionStorage.pricingRfpDecisionId (when available)
 * 4) sessionStorage.pricingRfpDecisionData.rfp_id (when available)
 */
export function withRfpTemplateFields(context = {}, options = {}) {
  const base = context || {};
  const candidates = Array.isArray(options?.candidates) ? options.candidates : [];

  let sessionRfpId = '';
  let sessionDecisionRfpId = '';
  try {
    if (typeof window !== 'undefined' && window?.sessionStorage) {
      sessionRfpId = window.sessionStorage.getItem('pricingRfpDecisionId') || '';
      const rawDecision = window.sessionStorage.getItem('pricingRfpDecisionData');
      if (rawDecision) {
        const parsed = JSON.parse(rawDecision);
        sessionDecisionRfpId = parsed?.rfp_id || '';
      }
    }
  } catch (e) {
    // ignore sessionStorage/JSON errors
  }

  const pickFirstNonEmpty = (vals) => {
    for (const v of vals) {
      if (typeof v === 'string' && v.trim() !== '') return v.trim();
    }
    return '';
  };

  const resolvedRfpId = pickFirstNonEmpty([
    base.rfpId,
    base.rfp_id,
    base.masterRfpId,
    base.master_rfp_id,
    ...candidates,
    sessionRfpId,
    sessionDecisionRfpId,
  ]);

  const resolvedMasterRfpId = pickFirstNonEmpty([
    base.masterRfpId,
    base.master_rfp_id,
    resolvedRfpId,
    sessionRfpId,
    sessionDecisionRfpId,
  ]);

  return {
    ...base,
    rfpId: resolvedRfpId,
    masterRfpId: resolvedMasterRfpId,
    // Legacy compatibility object for older templates
    rfp_requests: {
      id: resolvedRfpId || resolvedMasterRfpId,
      rfp_id: resolvedRfpId || resolvedMasterRfpId,
    },
  };
}

export default withRfpTemplateFields;

