/**
 * Fixes legacy quotation template issues where:
 * - HSN/SAC cell and QUANTITY cell end up using the same placeholder (e.g. {{this.hsn}} twice)
 * - Some templates used {{this.length}} for quantity (legacy)
 *
 * We fix this at render-time so both "create" and "view" modes behave consistently.
 */
export function fixQuotationTemplateHtml(html) {
  if (!html || typeof html !== 'string') return html;

  let out = html;

  // Replace the 2nd occurrence of {{this.hsn}} inside each <tr> (row-scoped).
  // This ensures HSN/SAC shows HSN and QUANTITY shows quantity.
  out = out.replace(/(<tr[^>]*>)([\s\S]*?)(<\/tr>)/gi, (_match, openTag, rowContent, closeTag) => {
    let occurrence = 0;
    const fixedRow = rowContent.replace(/\{\{\s*this\.(hsn|hsnCode)\s*\}\}/g, (placeholder) => {
      occurrence += 1;
      return occurrence === 2 ? '{{this.quantity}}' : placeholder;
    });
    return openTag + fixedRow + closeTag;
  });

  // Legacy: some templates use {{this.length}} for quantity
  out = out.replace(/\{\{\s*this\.length\s*\}\}/g, '{{this.quantity}}');

  return out;
}

