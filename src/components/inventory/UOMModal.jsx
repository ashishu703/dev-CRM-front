import React, { useState, useEffect } from 'react';
import { X, Plus, Search, Info, Edit, Trash2 } from 'lucide-react';
import inventoryService from '../../services/inventoryService';

const UOMModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [newUnit, setNewUnit] = useState({ code: '', name: '', description: '' });
  const [defaultUnit, setDefaultUnit] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUOMs();
    }
  }, [isOpen]);

  const fetchUOMs = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getAllUOMs();
      if (response.success) {
        setUnits(response.data || []);
        const defaultUom = response.data.find(u => u.is_default);
        if (defaultUom) {
          setDefaultUnit(defaultUom.id);
        }
      }
    } catch (error) {
      console.error('Error fetching UOMs:', error);
      alert('Failed to fetch UOMs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnit = () => {
    setEditingUnit(null);
    setNewUnit({ code: '', name: '', description: '' });
    setShowAddUnitModal(true);
  };

  const handleEditUnit = (unit) => {
    setEditingUnit(unit);
    setNewUnit({
      code: unit.code,
      name: unit.name,
      description: unit.description || ''
    });
    setShowAddUnitModal(true);
  };

  const handleSaveUnit = async () => {
    if (!newUnit.code.trim() || !newUnit.name.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingUnit) {
        await inventoryService.updateUOM(editingUnit.id, {
          code: newUnit.code.toUpperCase(),
          name: newUnit.name,
          description: newUnit.description || null
        });
      } else {
        await inventoryService.createUOM({
          code: newUnit.code.toUpperCase(),
          name: newUnit.name,
          description: newUnit.description || null
        });
      }
      setShowAddUnitModal(false);
      setNewUnit({ code: '', name: '', description: '' });
      setEditingUnit(null);
      fetchUOMs();
    } catch (error) {
      console.error('Error saving UOM:', error);
      alert('Failed to save UOM');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await inventoryService.setDefaultUOM(id);
      setDefaultUnit(id);
      fetchUOMs();
    } catch (error) {
      console.error('Error setting default UOM:', error);
      alert('Failed to set default UOM');
    }
  };

  const handleDeleteUnit = async (id) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) {
      return;
    }

    try {
      await inventoryService.deleteUOM(id);
      fetchUOMs();
    } catch (error) {
      console.error('Error deleting UOM:', error);
      alert('Failed to delete UOM');
    }
  };

  const filteredUnits = units.filter(unit =>
    unit.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (unit.description && unit.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[600px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-900">Manage Unit of Measurement</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Description */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              You can easily manage unit of measurement by adding new ones, editing existing ones, or deleting any you no longer need. This helps keep your content organized and easy to navigate.
            </p>
          </div>

          {/* Search and Add Button */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Unit of measurement"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <button 
              onClick={handleAddUnit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add New Unit
            </button>
          </div>

          {/* Units Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit of Measurement</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? 'No units found matching your search.' : 'No units found. Add a new unit to get started.'}
                    </td>
                  </tr>
                ) : (
                  filteredUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{unit.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{unit.description || unit.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {unit.is_default ? (
                            <span className="px-3 py-1 text-xs font-medium rounded text-green-700 bg-green-100">
                              Default
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleSetDefault(unit.id)}
                              className="px-3 py-1 text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              Set Default
                            </button>
                          )}
                          <button 
                            onClick={() => handleEditUnit(unit)}
                            className="p-1 text-blue-600 hover:text-blue-700 transition-colors" 
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUnit(unit.id)}
                            className="p-1 text-red-600 hover:text-red-700 transition-colors" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Unit Modal */}
      {showAddUnitModal && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
            onClick={() => {
              setShowAddUnitModal(false);
              setNewUnit({ code: '', name: '', description: '' });
              setEditingUnit(null);
            }}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-md pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingUnit ? 'Edit Unit' : 'Add New Unit'}
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUnit.code}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveUnit();
                      } else if (e.key === 'Escape') {
                        setShowAddUnitModal(false);
                        setNewUnit({ code: '', name: '', description: '' });
                        setEditingUnit(null);
                      }
                    }}
                    placeholder="e.g., MTR, KGS, PCS"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    autoFocus
                    disabled={!!editingUnit}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUnit.name}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, name: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveUnit();
                      }
                    }}
                    placeholder="e.g., Meters, Kilograms, Pieces"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newUnit.description}
                    onChange={(e) => setNewUnit(prev => ({ ...prev, description: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveUnit();
                      }
                    }}
                    placeholder="Optional description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddUnitModal(false);
                    setNewUnit({ code: '', name: '', description: '' });
                    setEditingUnit(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUnit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingUnit ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UOMModal;

