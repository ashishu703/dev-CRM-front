import React from 'react';
import { FileText } from 'lucide-react';
import ReportCard from '../../components/reports/ReportCard';
import { getAllReports } from '../../config/reportsConfig';

const ReportsPage = ({ setActiveView }) => {
  console.log('📊 ReportsPage: Component rendered');

  const handleReportSelect = (reportId) => {
    console.log('ReportsPage: Report selected:', reportId);
    if (setActiveView) {
      setActiveView(`detailed-report-${reportId}`);
    }
  };

  const reports = getAllReports();

  return (
    <div className="h-full p-6" style={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      backgroundAttachment: 'fixed'
    }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>Reports</h1>
              <p className="text-sm text-gray-600 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>View and analyze your sales performance, leads, activities, and more</p>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/50 p-6" style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                id={report.id}
                title={report.title}
                description={report.description}
                icon={report.icon}
                color={report.color}
                category={report.category}
                reportCount={report.reportCount}
                onClick={handleReportSelect}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

