'use client'

import { useState, useEffect } from 'react'
import { Item, Category, Box } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PencilIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export default function SearchInterface() {
  const [searchTerm, setSearchTerm] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [boxes, setBoxes] = useState<Box[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_box' | 'out_of_box'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [roomFilter, setRoomFilter] = useState<string>('all')
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false
  })

  useEffect(() => {
    fetchFilters()
    // Load items by default on component mount
    searchItems(1)
  }, [])

  useEffect(() => {
    // Reset to page 1 when search term or filters change
    searchItems(1)
  }, [searchTerm, statusFilter, categoryFilter, roomFilter])

  useEffect(() => {
    filterItems()
  }, [items, statusFilter, categoryFilter, roomFilter])

  const fetchFilters = async () => {
    try {
      const [categoriesResponse, boxesResponse] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/boxes')
      ])
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      }
      
      if (boxesResponse.ok) {
        const boxesData = await boxesResponse.json()
        setBoxes(boxesData)
      }
    } catch (error) {
      console.error('Error fetching filters:', error)
    }
  }

  const searchItems = async (page: number = 1) => {
    setLoading(true)
    try {
      const searchParams = new URLSearchParams()
      searchParams.append('page', page.toString())
      searchParams.append('limit', pagination.limit.toString())
      
      if (searchTerm.trim()) {
        searchParams.append('search', searchTerm)
      }
      
      const response = await fetch(`/api/items?${searchParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
        setPagination(data.pagination || pagination)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = items
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter)
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category_id?.toString() === categoryFilter)
    }
    
    if (roomFilter !== 'all') {
      filtered = filtered.filter(item => item.box_location === roomFilter)
    }
    
    setFilteredItems(filtered)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      searchItems(newPage)
    }
  }

  // Get unique room locations from boxes
  const rooms = Array.from(new Set(boxes.map(box => box.location).filter(Boolean)))

  const toggleItemStatus = async (itemId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'in_box' ? 'out_of_box' : 'in_box'
      const response = await fetch(`/api/items/${itemId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedItems = items.map(item => 
          item.id === itemId ? { ...item, status: newStatus as 'in_box' | 'out_of_box' } : item
        )
        setItems(updatedItems)
      }
    } catch (error) {
      console.error('Error updating item status:', error)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setCategoryFilter('all')
    setRoomFilter('all')
  }

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || roomFilter !== 'all'

  return (
    <div>
      {/* Search Bar */}
      <div className="card mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search items by name, description, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base transition-colors duration-200"
          />
        </div>
        
        {/* Filters */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                  Active
                </span>
              )}
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
              >
                Clear all
              </button>
            )}
          </div>
          
          {showFilters && (
            <div className="mt-3 space-y-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All Items' },
                    { value: 'in_box', label: 'In Box' },
                    { value: 'out_of_box', label: 'Out of Box' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setStatusFilter(option.value as any)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                        statusFilter === option.value
                          ? 'bg-primary-600 dark:bg-primary-700 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  Room/Location
                </label>
                <select
                  value={roomFilter}
                  onChange={(e) => setRoomFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200"
                >
                  <option value="all">All Locations</option>
                  {rooms.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400 transition-colors duration-200">Loading items...</p>
        </div>
      )}

      {!loading && filteredItems.length === 0 && pagination.total > 0 && (
        <div className="card text-center py-12">
          <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4 transition-colors duration-200" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">No items match your filters</h3>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200 mb-4">
            Try adjusting your search terms or filters to see more results.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            Clear filters
          </button>
        </div>
      )}

      {!loading && pagination.total === 0 && (
        <div className="card text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4 transition-colors duration-200">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">No items yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-200">
            Start by adding your first item to the storage system.
          </p>
          <Link
            href="/items/add"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
          >
            Add First Item
          </Link>
        </div>
      )}

      {filteredItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
              Showing {filteredItems.length} of {pagination.total} item{pagination.total !== 1 ? 's' : ''}
              {hasActiveFilters && ' (filtered)'}
            </p>
          </div>
          
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="card hover:shadow-md dark:hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* Item Image */}
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden transition-colors duration-200">
                      {item.image_path ? (
                        <Image
                          src={item.image_path}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PhotoIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>


                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 truncate transition-colors duration-200">
                          {item.name}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0 transition-colors duration-200">
                          Box #{item.box_number}
                        </span>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2 transition-colors duration-200">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        {item.category_name && (
                          <span 
                            className={`text-xs px-2 py-1 rounded transition-colors duration-200 flex items-center ${
                              !item.category_color ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' : ''
                            }`}
                            style={{
                              backgroundColor: item.category_color ? `${item.category_color}30` : undefined,
                              color: item.category_color || undefined
                            }}
                          >
                            <div 
                              className="w-2 h-2 rounded-full mr-1.5"
                              style={{ backgroundColor: item.category_color || '#6b7280' }}
                            ></div>
                            {item.category_name}
                          </span>
                        )}
                        {item.box_location && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded transition-colors duration-200">
                            {item.box_location}
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full transition-colors duration-200 ${
                          item.status === 'in_box'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                        }`}>
                          {item.status === 'in_box' ? 'In Box' : 'Out of Box'}
                        </span>
                        {item.quantity > 1 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                            Qty: {item.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => toggleItemStatus(item.id, item.status)}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        item.status === 'in_box'
                          ? 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                          : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                      title={item.status === 'in_box' ? 'Mark as out of box' : 'Mark as in box'}
                    >
                      {item.status === 'in_box' ? (
                        <ExclamationCircleIcon className="h-5 w-5" />
                      ) : (
                        <CheckCircleIcon className="h-5 w-5" />
                      )}
                    </button>
                    <Link
                      href={`/items/${item.id}/edit`}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      title="Edit item"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-200">
                    Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                    <span className="font-medium">{pagination.totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i
                      if (pageNum > pagination.totalPages) return null
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                            pageNum === pagination.page
                              ? 'z-10 bg-primary-50 dark:bg-primary-900/50 border-primary-500 text-primary-600 dark:text-primary-400'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 