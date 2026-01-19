export function renderTemplate(html, context = {}) {
  if (!html) return '';

  const resolvePath = (obj, path) => {
    if (!obj || !path) return '';
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current == null) return '';
      current = current[part];
    }
    return current == null ? '' : current;
  };

  const isTruthy = (value) => {
    if (value === null || value === undefined) return false;
    if (value === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === 'object' && Object.keys(value).length === 0) return false;
    return true;
  };

  // Find matching closing tag for nested blocks
  const findMatchingClose = (text, startPos, openTag, closeTag) => {
    let depth = 1;
    let pos = startPos;
    const closeLen = closeTag.length;
    const openTagLen = openTag.length;

    while (pos < text.length && depth > 0) {
      // Find next opening tag
      const openIdx = text.indexOf(openTag, pos);
      
      // Find next closing tag
      const closeIdx = text.indexOf(closeTag, pos);

      if (closeIdx === -1) return -1; // No closing tag found

      if (openIdx !== -1 && openIdx < closeIdx) {
        depth++;
        pos = openIdx + openTagLen;
      } else {
        depth--;
        if (depth === 0) return closeIdx;
        pos = closeIdx + closeLen;
      }
    }
    return -1;
  };

  const renderBlock = (block, data) => {
    let rendered = block;
    let changed = true;
    let iterations = 0;
    const maxIterations = 50;

    while (changed && iterations < maxIterations) {
      iterations++;
      changed = false;
      const before = rendered;

      // Handle {{#if}} blocks with {{else}} - use findMatchingClose for nested blocks
      const ifElsePattern = /\{\{#if\s+([^}]+)\}\}/g;
      let match;
      let foundMatch = false;
      while ((match = ifElsePattern.exec(rendered)) !== null && !foundMatch) {
        const startPos = match.index;
        const conditionPath = match[1].trim();
        
        // Find matching closing tag (handles nested blocks)
        const closePos = findMatchingClose(rendered, startPos + match[0].length, '{{#if', '{{/if}}');
        
        if (closePos !== -1) {
          const blockContent = rendered.substring(startPos + match[0].length, closePos);
          
          // Check for {{else}} within this block
          const elsePos = blockContent.indexOf('{{else}}');
          
          if (elsePos !== -1) {
            // Has else clause
            const ifInner = blockContent.substring(0, elsePos);
            const elseInner = blockContent.substring(elsePos + 8);
            const value = resolvePath(data, conditionPath);
            
            const replacement = isTruthy(value) 
              ? renderBlock(ifInner, data) 
              : renderBlock(elseInner, data);
            
            rendered = rendered.substring(0, startPos) + replacement + rendered.substring(closePos + 7);
            changed = true;
            foundMatch = true;
          } else {
            // No else clause
            const value = resolvePath(data, conditionPath);
            const replacement = isTruthy(value) ? renderBlock(blockContent, data) : '';
            rendered = rendered.substring(0, startPos) + replacement + rendered.substring(closePos + 7);
            changed = true;
            foundMatch = true;
          }
        }
      }

      if (foundMatch) continue; // Restart loop after modification

      // Handle {{#unless}} blocks - use findMatchingClose for nested blocks
      const unlessPattern = /\{\{#unless\s+([^}]+)\}\}/g;
      foundMatch = false;
      while ((match = unlessPattern.exec(rendered)) !== null && !foundMatch) {
        const startPos = match.index;
        const conditionPath = match[1].trim();
        
        // Find matching closing tag (handles nested blocks)
        const closePos = findMatchingClose(rendered, startPos + match[0].length, '{{#unless', '{{/unless}}');
        
        if (closePos !== -1) {
          const blockContent = rendered.substring(startPos + match[0].length, closePos);
          
          // Check for {{else}} within this block
          const elsePos = blockContent.indexOf('{{else}}');
          
          if (elsePos !== -1) {
            // Has else clause
            const unlessInner = blockContent.substring(0, elsePos);
            const elseInner = blockContent.substring(elsePos + 8);
            const value = resolvePath(data, conditionPath);
            
            const replacement = !isTruthy(value) 
              ? renderBlock(unlessInner, data) 
              : renderBlock(elseInner, data);
            
            rendered = rendered.substring(0, startPos) + replacement + rendered.substring(closePos + 11);
            changed = true;
            foundMatch = true;
          } else {
            // No else clause
            const value = resolvePath(data, conditionPath);
            const replacement = !isTruthy(value) ? renderBlock(blockContent, data) : '';
            rendered = rendered.substring(0, startPos) + replacement + rendered.substring(closePos + 11);
            changed = true;
            foundMatch = true;
          }
        }
      }

      if (foundMatch) continue; // Restart loop after modification

      // Handle {{#each}} blocks
      const eachPattern = /\{\{#each\s+([^}]+)\}\}/g;
      foundMatch = false;
      while ((match = eachPattern.exec(rendered)) !== null && !foundMatch) {
        const startPos = match.index;
        const listPath = match[1].trim();
        
        // Use findMatchingClose to correctly handle nested {{#each}} blocks
        const closePos = findMatchingClose(rendered, startPos + match[0].length, '{{#each', '{{/each}}');
        
        if (closePos !== -1) {
          const inner = rendered.substring(startPos + match[0].length, closePos);
          const items = resolvePath(data, listPath);
          
          if (Array.isArray(items) && items.length > 0) {
            const replacement = items
              .map((item, index) => {
                const loopContext = {
                  ...data,
                  this: item,
                  '@index': index,
                  '@indexPlus1': index + 1,
                };
                return renderBlock(inner, loopContext);
              })
              .join('');
            rendered = rendered.substring(0, startPos) + replacement + rendered.substring(closePos + 9);
          } else {
            // Remove the block if items is empty or not an array
            rendered = rendered.substring(0, startPos) + rendered.substring(closePos + 9);
          }
          changed = true;
          foundMatch = true;
        }
      }

      if (before === rendered) {
        changed = false;
      }
    }

    // Handle simple variable replacements {{variable}} or {{path.to.variable}}
    rendered = rendered.replace(/\{\{\s*([^#\/][^}]*?)\s*\}\}/g, (match, rawPath) => {
      const path = rawPath.trim();
      if (!path) return '';
      if (path === '@index') return String(resolvePath(data, '@index') || '');
      if (path === '@indexPlus1') return String(resolvePath(data, '@indexPlus1') || '');
      const value = resolvePath(data, path);
      return value != null ? String(value) : '';
    });

    return rendered;
  };

  return renderBlock(html, context);
}

export default renderTemplate;
