import React, { useState, useEffect } from 'react';
import { useMonth } from '../../context/MonthContext';
import ReportsService from '../../services/ReportsService';
import MonthSelector from '../../components/MonthSelector';

const TargetAssignment = () => {
  const { selectedMonth, monthDisplay, isMonthClosed } = useMonth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [headTarget, setHeadTarget] = useState(0);
  const [salespersonTargets, setSalespersonTargets] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchTeamData();
  }, [selectedMonth]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ReportsService.getTeamSummary(selectedMonth);
      
      if (response.success) {
        const teamData = response.data.team_summary || [];
        setTeamMembers(teamData);
        
        // Initialize targets from existing data
        const targets = {};
        teamData.forEach(member => {
          targets[member.salesperson_id] = member.target_amount || 0;
        });
        setSalespersonTargets(targets);
        
        // Calculate head target as sum of individual targets
        const totalTarget = teamData.reduce((sum, member) => 
          sum + Number(member.target_amount || 0), 0
        );
        setHeadTarget(totalTarget);
      } else {
        setError(response.message || 'Failed to fetch team data');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleHeadTargetChange = (value) => {
    const numValue = Number(value) || 0;
    setHeadTarget(numValue);
    
    // Auto-distribute to salespersons if head target increases
    if (teamMembers.length > 0) {
      const targets = {};
      const equalShare = Math.floor(numValue / teamMembers.length);
      let remaining = numValue;
      
      teamMembers.forEach((member, index) => {
        if (index === teamMembers.length - 1) {
          // Last member gets remaining
          targets[member.salesperson_id] = remaining;
        } else {
          targets[member.salesperson_id] = equalShare;
          remaining -= equalShare;
        }
      });
      
      setSalespersonTargets(targets);
    }
  };

  const handleSalespersonTargetChange = (salespersonId, value) => {
    const numValue = Number(value) || 0;
    setSalespersonTargets(prev => ({
      ...prev,
      [salespersonId]: numValue
    }));
  };

  const getTotalSalespersonTargets = () => {
    return Object.values(salespersonTargets).reduce((sum, target) => sum + Number(target || 0), 0);
  };

  const validateTargets = () => {
    const total = getTotalSalespersonTargets();
    return total <= headTarget;
  };

  const handleSave = async () => {
    if (!validateTargets()) {
      setError('Sum of salesperson targets cannot exceed head target');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // This would call a target assignment API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSuccess('Targets saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save targets: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    const num = Number(amount || 0);
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getValidationMessage = () => {
    const total = getTotalSalespersonTargets();
    const difference = headTarget - total;
    
    if (difference < 0) {
      return {
        type: 'error',
        message: `Exceeds head target by ${formatCurrency(Math.abs(difference))}`
      };
    } else if (difference > 0) {
      return {
        type: 'warning',
        message: `${formatCurrency(difference)} remaining from head target`
      };
    }
    
    return { type: 'success', message: 'Targets balanced' };
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="divide-y">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 h-20 bg-gray-100"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const validation = getValidationMessage();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Target Assignment</h1>
          <p className="text-gray-600">Set monthly targets for {monthDisplay}</p>
        </div>
        <MonthSelector />
      </div>

      {/* Month Status */}
      {isMonthClosed && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h.013M12 19V9m0 6h.01M12 19h.01" />
            </svg>
            <span className="text-yellow-800">
              This month ({monthDisplay}) is closed. Targets are now read-only.
            </span>
          </div>
        </div>
      )}

      {/* Head Target Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Head Target for {monthDisplay}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <input
                type="number"
                value={headTarget}
                onChange={(e) => handleHeadTargetChange(e.target.value)}
                disabled={isMonthClosed || saving}
                className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-bold"
                placeholder="0"
              />
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Total Target</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(headTarget)}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Message */}
      <div className={`rounded-lg p-4 ${
        validation.type === 'error' ? 'bg-red-50 border border-red-200' :
        validation.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
        'bg-green-50 border border-green-200'
      }`}>
        <div className="flex items-center">
          <svg className={`w-5 h-5 mr-2 ${
            validation.type === 'error' ? 'text-red-600' :
            validation.type === 'warning' ? 'text-yellow-600' :
            'text-green-600'
          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {validation.type === 'error' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M12 12V8m0 4h.01" />
            )}
            {validation.type === 'warning' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h.013M12 19V9m0 6h.01M12 19h.01" />
            )}
            {validation.type === 'success' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm-2 8h.01M12 17l.01-4M12 17l.01-4" />
            )}
          </svg>
          <span className={`font-medium ${
            validation.type === 'error' ? 'text-red-800' :
            validation.type === 'warning' ? 'text-yellow-800' :
            'text-green-800'
          }`}>
            {validation.message}
          </span>
        </div>
      </div>

      {/* Salesperson Targets */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Salesperson Targets</h2>
        </div>
        
        {teamMembers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No team members found for this month
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salesperson
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    % of Head Target
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Achievement
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member, index) => {
                  const targetAmount = Number(salespersonTargets[member.salesperson_id] || 0);
                  const percentage = headTarget > 0 ? (targetAmount / headTarget) * 100 : 0;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          {member.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <input
                          type="number"
                          value={targetAmount}
                          onChange={(e) => handleSalespersonTargetChange(member.salesperson_id, e.target.value)}
                          disabled={isMonthClosed || saving}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`text-sm font-medium ${
                          percentage >= 100 ? 'text-green-600' :
                          percentage >= 75 ? 'text-blue-600' :
                          percentage >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <span className="font-medium text-green-600">
                          {formatCurrency(member.achieved_amount)}
                        </span>
                        <span className="text-gray-500 ml-2">
                          ({((member.achieved_amount || 0) / (member.target_amount || 1) * 100).toFixed(1)}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => fetchTeamData()}
          disabled={saving}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={isMonthClosed || saving || !validateTargets()}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Targets'}
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm-2 8h.01M12 17l.01-4M12 17l.01-4" />
            </svg>
            <span className="text-green-800 font-medium">{success}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M12 12V8m0 4h.01" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TargetAssignment;
