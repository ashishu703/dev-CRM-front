import React, { useMemo, useEffect } from 'react';
import renderTemplate from '../utils/renderTemplate';

const DynamicTemplateRenderer = ({ html, data, containerId }) => {
  const renderedHtml = useMemo(() => {
    if (!html) return '';
    try {
      return renderTemplate(html, data || {});
    } catch (error) {
      console.error('Error rendering template:', error);
      return html;
    }
  }, [html, data]);

  // Inject CSS to remove logo box border
  useEffect(() => {
    const styleId = `${containerId}-logo-fix`;
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .logo-box {
          border: none !important;
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
    };
  }, [containerId]);

  if (!html) {
    return null;
  }

  return (
    <div
      id={containerId}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

export default DynamicTemplateRenderer;
