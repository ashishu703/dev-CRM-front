import React, { useState } from 'react';
import DataTable from './DataTable';

const InventoryApproval = () => {
  const [approvals] = useState([
    {
      id: 1,
      approvalId: 'INA2',
      documentType: 'New Item Added',
      documentNumber: '',
      approvalStatus: 'Auto Approved',
      requestedDateTime: '04/12/2025, 12:23:45 pm',
      requestedBy: 'rajvansh@anocab.com'
    },
    {
      id: 2,
      approvalId: 'INA1',
      documentType: 'New Item Added',
      documentNumber: '',
      approvalStatus: 'Auto Approved',
      requestedDateTime: '04/12/2025, 12:18:07 pm',
      requestedBy: 'rajvansh@anocab.com'
    }
  ]);

  const columns = [
    {
      key: 'approvalId',
      label: 'Approval ID',
      sortable: true,
      render: (row) => (
        <span className="font-medium text-gray-900">{row.approvalId}</span>
      )
    },
    {
      key: 'documentType',
      label: 'Document Type',
      sortable: true,
      render: (row) => (
        <span className="text-gray-900">{row.documentType}</span>
      )
    },
    {
      key: 'documentNumber',
      label: 'Document Number',
      sortable: true,
      render: (row) => (
        <span className="text-gray-500">{row.documentNumber || '-'}</span>
      )
    },
    {
      key: 'approvalStatus',
      label: 'Approval Status',
      sortable: true,
      render: (row) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {row.approvalStatus}
        </span>
      )
    },
    {
      key: 'requestedDateTime',
      label: 'Requested Date/Time',
      sortable: true,
      render: (row) => (
        <span className="text-gray-900">{row.requestedDateTime}</span>
      )
    },
    {
      key: 'requestedBy',
      label: 'Requested By',
      sortable: true,
      render: (row) => (
        <span className="text-gray-900">{row.requestedBy}</span>
      )
    }
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Data Table */}
      <DataTable
        columns={columns}
        data={approvals}
        searchPlaceholder="Search approvals..."
        defaultItemsPerPage={20}
      />
    </div>
  );
};

export default InventoryApproval;

