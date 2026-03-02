import React, { memo } from 'react';
import SalesPipelineStrip from './SalesPipelineStrip';

/**
 * Full-width Sales Pipeline section.
 * KPI strip (conversion %, avg time to close) + funnel + stage table.
 * Pipeline value / probability weighted shown only in TargetRevenueSection.
 */
const SalesPipelineSection = memo(function SalesPipelineSection({ salesPipelineCRM, salesPipelineStrip, onStageClick }) {
  return (
    <SalesPipelineStrip
      salesPipelineStrip={salesPipelineStrip}
      salesPipelineCRM={salesPipelineCRM}
      hidePipelineValue
      onStageClick={onStageClick}
    />
  );
});

export default SalesPipelineSection;
