import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, ChevronDown, ChevronRight, Search } from 'lucide-react';
import inventoryService from '../../services/inventoryService';

const CategoriesModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddSubcategoryModal, setShowAddSubcategoryModal] = useState(false);
  const [showAddMicrocategoryModal, setShowAddMicrocategoryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [parentCategoryId, setParentCategoryId] = useState(null);
  const [parentSubcategoryId, setParentSubcategoryId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getCategoryTree();
      if (response.success) {
        console.log('Raw categories from API:', response.data);
        const categoryTree = buildCategoryTree(response.data || []);
        console.log('Built category tree:', categoryTree);
        setCategories(categoryTree);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const buildCategoryTree = (flatCategories) => {
    if (!flatCategories || flatCategories.length === 0) {
      return [];
    }

    const categoryMap = {};
    const rootCategories = [];

    flatCategories.forEach(cat => {
      categoryMap[cat.id] = {
        ...cat,
        subCategories: [],
        microCategories: []
      };
    });

    flatCategories.forEach(cat => {
      if (cat.parent_id === null) {
        rootCategories.push(categoryMap[cat.id]);
      } else {
        const parent = categoryMap[cat.parent_id];
        if (parent) {
          const childCategory = categoryMap[cat.id];
          if (parent.parent_id === null) {
            parent.subCategories.push(childCategory);
          } else {
            const subcategoryParent = categoryMap[parent.parent_id];
            if (subcategoryParent && subcategoryParent.parent_id === null) {
              const subcategory = subcategoryParent.subCategories.find(s => s.id === parent.id);
              if (subcategory) {
                subcategory.microCategories.push(childCategory);
              } else {
                if (!parent.microCategories) {
                  parent.microCategories = [];
                }
                parent.microCategories.push(childCategory);
              }
            } else {
              if (!parent.microCategories) {
                parent.microCategories = [];
              }
              parent.microCategories.push(childCategory);
            }
          }
        }
      }
    });

    return rootCategories;
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleAddCategory = () => {
    setShowAddCategoryModal(true);
    setParentCategoryId(null);
    setNewCategoryName('');
  };

  const handleAddSubcategory = (categoryId) => {
    setShowAddSubcategoryModal(true);
    setParentCategoryId(categoryId);
    setParentSubcategoryId(null);
    setNewCategoryName('');
    setNewCategoryDescription('');
  };

  const handleAddMicrocategory = (subcategoryId, categoryId) => {
    setShowAddMicrocategoryModal(true);
    setParentSubcategoryId(subcategoryId);
    setParentCategoryId(categoryId);
    setNewCategoryName('');
    setNewCategoryDescription('');
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
    setNewCategoryName(item.name);
    setNewCategoryDescription(item.description || '');
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await inventoryService.deleteCategory(itemId);
      if (response.success) {
        await fetchCategories();
      } else {
        throw new Error(response.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      const errorMessage = error.message || error.error || 'Unknown error';
      alert(`Failed to delete category: ${errorMessage}`);
    }
  };

  const handleSaveCategory = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    try {
      let response;
      if (showAddCategoryModal) {
        response = await inventoryService.createCategory({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || null,
          parent_id: null
        });
        if (response.success) {
          setShowAddCategoryModal(false);
        } else {
          throw new Error(response.message || 'Failed to create category');
        }
      } else if (showAddSubcategoryModal) {
        if (!parentCategoryId) {
          alert('Parent category ID is missing');
          return;
        }
        response = await inventoryService.createCategory({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || null,
          parent_id: parseInt(parentCategoryId)
        });
        if (response.success) {
          setShowAddSubcategoryModal(false);
          setParentCategoryId(null);
        } else {
          throw new Error(response.message || 'Failed to create subcategory');
        }
      } else if (showAddMicrocategoryModal) {
        if (!parentSubcategoryId) {
          alert('Parent subcategory ID is missing');
          return;
        }
        response = await inventoryService.createCategory({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || null,
          parent_id: parseInt(parentSubcategoryId)
        });
        if (response.success) {
          setShowAddMicrocategoryModal(false);
          setParentSubcategoryId(null);
          setParentCategoryId(null);
        } else {
          throw new Error(response.message || 'Failed to create microcategory');
        }
      } else if (showEditModal && editingItem) {
        response = await inventoryService.updateCategory(editingItem.id, {
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim() || null
        });
        if (response.success) {
          setShowEditModal(false);
          setEditingItem(null);
        } else {
          throw new Error(response.message || 'Failed to update category');
        }
      }

      setNewCategoryName('');
      setNewCategoryDescription('');
      await fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      const errorMessage = error.message || error.data?.message || error.error || 'Unknown error occurred';
      alert(errorMessage);
    }
  };

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.subCategories.some(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.microCategories.some(micro => micro.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    return matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-900">Manage Category</h2>
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
              You can easily manage Categories, Subcategories, and Microcategories by adding new ones, editing existing ones, or deleting any you no longer need. This helps keep your content organized and easy to navigate.
            </p>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Category"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Add New Category Button */}
          <button 
            onClick={handleAddCategory}
            className="w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Category
          </button>

          {/* Categories List */}
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No categories found matching your search.' : 'No categories found. Add a new category to get started.'}
              </div>
            ) : (
              filteredCategories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg">
                {/* Category Header */}
                <div className="flex items-center justify-between p-3 hover:bg-gray-50">
                  <div className="flex items-center gap-2 flex-1">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {expandedCategories[category.id] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleAddSubcategory(category.id)}
                      className="p-1 text-blue-600 hover:text-blue-700" 
                      title="Add Subcategory"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEdit(category)}
                      className="p-1 text-blue-600 hover:text-blue-700" 
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      className="p-1 text-red-600 hover:text-red-700" 
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {expandedCategories[category.id] && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    {category.subCategories.length === 0 ? (
                      <div className="p-3 pl-8 text-sm text-gray-500">No subcategories</div>
                    ) : (
                      category.subCategories.map((subCategory) => (
                        <div key={subCategory.id}>
                          <div className="flex items-center justify-between p-3 pl-8 hover:bg-gray-100">
                            <div className="flex items-center gap-2 flex-1">
                              <button
                                onClick={() => {
                                  setExpandedSubcategories(prev => ({
                                    ...prev,
                                    [subCategory.id]: !prev[subCategory.id]
                                  }));
                                }}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                {expandedSubcategories[subCategory.id] ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                              <span className="text-sm text-gray-700">{subCategory.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleAddMicrocategory(subCategory.id, category.id)}
                                className="p-1 text-blue-600 hover:text-blue-700" 
                                title="Add Microcategory"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEdit(subCategory)}
                                className="p-1 text-blue-600 hover:text-blue-700" 
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(subCategory.id)}
                                className="p-1 text-red-600 hover:text-red-700" 
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {/* Microcategories */}
                          {expandedSubcategories[subCategory.id] && (
                            <div className="border-t border-gray-200 bg-gray-100">
                              {subCategory.microCategories.length === 0 ? (
                                <div className="p-3 pl-16 text-xs text-gray-500">No microcategories</div>
                              ) : (
                                subCategory.microCategories.map((microCategory) => (
                                  <div key={microCategory.id} className="flex items-center justify-between p-2 pl-16 hover:bg-gray-200">
                                    <span className="text-xs text-gray-600">{microCategory.name}</span>
                                    <div className="flex items-center gap-2">
                                      <button 
                                        onClick={() => handleEdit(microCategory)}
                                        className="p-1 text-blue-600 hover:text-blue-700" 
                                        title="Edit"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button 
                                        onClick={() => handleDelete(microCategory.id)}
                                        className="p-1 text-red-600 hover:text-red-700" 
                                        title="Delete"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      {(showAddCategoryModal || showEditModal) && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
            onClick={() => {
              setShowAddCategoryModal(false);
              setShowEditModal(false);
              setNewCategoryName('');
              setEditingItem(null);
            }}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-white rounded-lg shadow-xl w-full max-w-md pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {showEditModal ? 'Edit Category' : 'Add Category'}
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveCategory();
                      } else if (e.key === 'Escape') {
                        setShowAddCategoryModal(false);
                        setShowEditModal(false);
                        setNewCategoryName('');
                        setNewCategoryDescription('');
                        setEditingItem(null);
                      }
                    }}
                    placeholder="Enter category name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Enter category description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setShowEditModal(false);
                    setNewCategoryName('');
                    setNewCategoryDescription('');
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSaveCategory(e);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showEditModal ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Subcategory Modal - Separate Type */}
      {showAddSubcategoryModal && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
            onClick={() => {
              setShowAddSubcategoryModal(false);
              setNewCategoryName('');
              setParentCategoryId(null);
            }}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Add Subcategory</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Add a subcategory under {categories.find(c => c.id === parentCategoryId)?.name || 'category'}
                </p>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Subcategory Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveCategory();
                      } else if (e.key === 'Escape') {
                        setShowAddSubcategoryModal(false);
                        setNewCategoryName('');
                        setParentCategoryId(null);
                      }
                    }}
                    placeholder="Enter subcategory name"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-gray-400"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Enter subcategory description"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-gray-400 resize-none"
                  />
                </div>
              </div>
              <div className="p-4 border-t border-gray-700 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddSubcategoryModal(false);
                    setNewCategoryName('');
                    setNewCategoryDescription('');
                    setParentCategoryId(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSaveCategory(e);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Subcategory
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Microcategory Modal */}
      {showAddMicrocategoryModal && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
            onClick={() => {
              setShowAddMicrocategoryModal(false);
              setNewCategoryName('');
              setNewCategoryDescription('');
              setParentSubcategoryId(null);
              setParentCategoryId(null);
            }}
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Add Microcategory</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Add a microcategory under {categories.find(c => c.id === parentCategoryId)?.subCategories?.find(s => s.id === parentSubcategoryId)?.name || 'subcategory'}
                </p>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Microcategory Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveCategory(e);
                      } else if (e.key === 'Escape') {
                        setShowAddMicrocategoryModal(false);
                        setNewCategoryName('');
                        setNewCategoryDescription('');
                        setParentSubcategoryId(null);
                        setParentCategoryId(null);
                      }
                    }}
                    placeholder="Enter microcategory name"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-gray-400"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                    placeholder="Enter microcategory description"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-gray-400 resize-none"
                  />
                </div>
              </div>
              <div className="p-4 border-t border-gray-700 flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddMicrocategoryModal(false);
                    setNewCategoryName('');
                    setNewCategoryDescription('');
                    setParentSubcategoryId(null);
                    setParentCategoryId(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSaveCategory(e);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Microcategory
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default CategoriesModal;

