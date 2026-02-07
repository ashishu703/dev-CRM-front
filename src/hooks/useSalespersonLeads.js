import { useState, useEffect, useMemo } from 'react'
import { apiClient, API_ENDPOINTS } from '../utils/globalImports'
import Toast from '../utils/Toast'
import { getDisplayPriority, getDisplayScore, getSalesWeight } from '../utils/leadPriorityUtils'
import { mapApiRowToLead } from '../utils/leadMapping'

export function useSalespersonLeads(initialCustomers = []) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    tag: '', followUpStatus: '', salesStatus: '', state: '', leadSource: '', productType: '', dateFrom: '', dateTo: ''
  })
  const [enabledFilters, setEnabledFilters] = useState({
    tag: false, followUpStatus: false, salesStatus: false, state: false, leadSource: false, productType: false, dateRange: false
  })
  const [filters, setFilters] = useState({ salesStatus: '' })
  const [filterCreatedToday, setFilterCreatedToday] = useState(false)
  const [sortBy, setSortBy] = useState('none')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    if (initialCustomers.length > 0) return
    const fetchAssigned = async () => {
      try {
        const res = await apiClient.get(API_ENDPOINTS.SALESPERSON_ASSIGNED_LEADS_ME())
        const rows = res?.data || []
        setCustomers(rows.map(mapApiRowToLead))
      } catch (err) {
        Toast.error('Failed to load assigned leads')
      }
    }
    fetchAssigned()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const tags = useMemo(() => {
    const uniqueTypes = [...new Set(customers.map(c => {
      const type = c.customerType
      return type && type !== 'N/A' ? type.toLowerCase() : null
    }).filter(Boolean))]
    return uniqueTypes.sort()
  }, [customers])

  const getUniqueFilterOptions = useMemo(() => {
    const cleanValue = (value) => {
      if (!value) return null
      const trimmed = String(value).trim()
      return trimmed && trimmed !== 'N/A' && trimmed !== 'null' && trimmed !== '' && trimmed.toLowerCase() !== 'n/a' ? trimmed : null
    }

    const allProductValues = []
    customers.forEach((c) => {
      let product = c.productName || c.product_type || c.productType || c.product_name || ''
      if (Array.isArray(product)) {
        product = product.filter(p => p && String(p).trim() !== '').join(', ')
      }
      if (typeof product === 'string' && product.includes(',')) {
        product.split(',').map(p => cleanValue(p)).filter(Boolean).forEach(p => allProductValues.push(p))
      } else {
        const cleaned = cleanValue(product)
        if (cleaned) allProductValues.push(cleaned)
      }
    })
    const uniqueProducts = [...new Set(allProductValues)].sort()

    const allSalesStatuses = customers.map(c => {
      const status = c.salesStatus || ''
      const trimmed = String(status).trim()
      if (trimmed && trimmed !== '' && trimmed.toLowerCase() !== 'null') return trimmed
      if (!trimmed || trimmed === '') return 'N/A'
      return null
    }).filter(Boolean)
    const uniqueSalesStatuses = [...new Set(allSalesStatuses)]
    if (!uniqueSalesStatuses.includes('N/A')) uniqueSalesStatuses.push('N/A')
    
    return {
      tags: [...new Set(customers.map(c => {
        const type = c.customerType
        return type && type !== 'N/A' ? type.toLowerCase() : null
      }).filter(Boolean))].sort(),
      followUpStatuses: [...new Set(customers.map(c => cleanValue(c.followUpStatus)).filter(Boolean))].sort(),
      salesStatuses: uniqueSalesStatuses.sort(),
      states: [...new Set(customers.map(c => cleanValue(c.state)).filter(Boolean))].sort(),
      leadSources: [...new Set(customers.map(c => cleanValue(c.enquiryBy)).filter(Boolean))].sort(),
      products: uniqueProducts
    }
  }, [customers])

  const todayLocal = useMemo(() => {
    const d = new Date()
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  }, [])

  const filteredCustomers = useMemo(() => {
    let filtered = customers
    if (filterCreatedToday) {
      filtered = filtered.filter(c => {
        const created = c.created_at || c.date || ''
        const createdStr = created ? (typeof created === 'string' && created.length >= 10 ? created.split('T')[0] : new Date(created).toISOString().split('T')[0]) : ''
        return createdStr === todayLocal
      })
    }
    if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim()
      filtered = filtered.filter(c => {
        const name = (c.name || '').toLowerCase()
        const phone = String(c.phone || '')
        const business = (c.business || '').toLowerCase()
        const email = (c.email || '').toLowerCase()
        const address = (c.address || '').toLowerCase()
        
        return name.includes(query) || 
               phone.includes(query) || 
               business.includes(query) || 
               email.includes(query) ||
               address.includes(query)
      })
    }

    if (selectedTag && selectedTag !== 'all') {
      filtered = filtered.filter(c => {
        const customerType = c.customerType ? c.customerType.toLowerCase() : ''
        return customerType === selectedTag.toLowerCase()
      })
    }

    if (filters.salesStatus) {
      filtered = filtered.filter(c => c.salesStatus === filters.salesStatus)
    }

    Object.entries(advancedFilters).forEach(([key, value]) => {
      if (enabledFilters[key] && value) {
        if (key === 'dateRange') {
          if (advancedFilters.dateFrom) filtered = filtered.filter(c => c.date >= advancedFilters.dateFrom)
          if (advancedFilters.dateTo) filtered = filtered.filter(c => c.date <= advancedFilters.dateTo)
        } else {
          const fieldMap = { tag: 'customerType', followUpStatus: 'followUpStatus', salesStatus: 'salesStatus', 
            state: 'state', leadSource: 'enquiryBy', productType: 'productName' }
          if (fieldMap[key]) {
            if (key === 'salesStatus' && value === 'N/A') {
              filtered = filtered.filter(c => {
                const status = c.salesStatus || '';
                const trimmed = String(status).trim().toLowerCase();
                return !trimmed || trimmed === '' || trimmed === 'n/a' || trimmed === 'null';
              });
            } else {
              filtered = filtered.filter(c => c[fieldMap[key]] === value)
            }
          }
        }
      }
    })

    const priorityRank = (c) => {
      const p = getDisplayPriority(c)
      if (p === 'CRITICAL') return 0
      if (p === 'HIGH') return 1
      if (p === 'MEDIUM') return 2
      if (p === 'LOW') return 3
      return 4
    }
    filtered = [...filtered].sort((a, b) => {
      const ra = priorityRank(a)
      const rb = priorityRank(b)
      if (ra !== rb) return ra - rb
      const scoreA = getDisplayScore(a)
      const scoreB = getDisplayScore(b)
      if (scoreB !== scoreA) return scoreB - scoreA
      const swDiff = getSalesWeight(b.salesStatus || '') - getSalesWeight(a.salesStatus || '')
      if (swDiff !== 0) return swDiff
      if (sortBy && sortBy !== 'none') {
        let aVal = a[sortBy]
        let bVal = b[sortBy]
        if (sortBy === 'date') {
          aVal = aVal ? new Date(aVal).getTime() : 0
          bVal = bVal ? new Date(bVal).getTime() : 0
        } else if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = (bVal || '').toLowerCase()
        }
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
      }
      return 0
    })

    return filtered
  }, [customers, debouncedSearchQuery, selectedTag, filters, advancedFilters, enabledFilters, sortBy, sortOrder, filterCreatedToday, todayLocal])

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredCustomers.slice(start, start + itemsPerPage)
  }, [filteredCustomers, currentPage, itemsPerPage])

  useEffect(() => {
    if (debouncedSearchQuery) {
      setCurrentPage(1)
    }
  }, [debouncedSearchQuery])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleAdvancedFilterChange = (filterKey, value) => {
    setAdvancedFilters(prev => ({ ...prev, [filterKey]: value }))
    setCurrentPage(1)
  }

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy)
    setCurrentPage(1)
  }

  const handleSortOrderChange = (newSortOrder) => {
    setSortOrder(newSortOrder)
    setCurrentPage(1)
  }

  const clearAdvancedFilters = () => {
    setAdvancedFilters({ tag: '', followUpStatus: '', salesStatus: '', state: '', leadSource: '', productType: '', dateFrom: '', dateTo: '' })
    setEnabledFilters({ tag: false, followUpStatus: false, salesStatus: false, state: false, leadSource: false, productType: false, dateRange: false })
  }

  const toggleFilterSection = (filterKey) => {
    setEnabledFilters(prev => ({ ...prev, [filterKey]: !prev[filterKey] }))
    if (enabledFilters[filterKey]) {
      if (filterKey === 'dateRange') {
        setAdvancedFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }))
      } else {
        setAdvancedFilters(prev => ({ ...prev, [filterKey]: '' }))
      }
    }
  }

  return {
    customers, setCustomers, searchQuery, setSearchQuery, selectedTag, setSelectedTag,
    filterCreatedToday, setFilterCreatedToday,
    showFilterPanel, setShowFilterPanel, advancedFilters, setAdvancedFilters, enabledFilters, setEnabledFilters, filters,
    tags, getUniqueFilterOptions, filteredCustomers, paginatedCustomers,
    currentPage, setCurrentPage, itemsPerPage, setItemsPerPage,
    handleFilterChange, handleAdvancedFilterChange, clearAdvancedFilters, toggleFilterSection,
    sortBy, setSortBy, sortOrder, setSortOrder, handleSortChange, handleSortOrderChange
  }
}
