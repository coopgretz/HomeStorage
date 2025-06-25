'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/lib/types'
import {
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface CategoryManagerProps {
  onCategoryChange?: () => void
}

export default function CategoryManager({ onCategoryChange }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', color: '#3b82f6' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save category')
      }

      await fetchCategories()
      onCategoryChange?.()
      resetForm()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete category')
      }

      await fetchCategories()
      onCategoryChange?.()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const startEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, color: category.color })
    setShowAddForm(true)
  }

  const resetForm = () => {
    setFormData({ name: '', color: '#3b82f6' })
    setEditingCategory(null)
    setShowAddForm(false)
    setError(null)
  }

  const predefinedColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#6b7280', '#84cc16', '#f97316'
  ]

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4 transition-colors duration-200"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-200"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 transition-colors duration-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center transition-colors duration-200">
          <TagIcon className="h-6 w-6 mr-2 text-primary-600 dark:text-primary-400 transition-colors duration-200" />
          Categories
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center text-sm"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded transition-colors duration-200">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-200">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 transition-colors duration-200">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-200">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-colors duration-200"
                placeholder="Enter category name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                Color
              </label>
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 transition-colors duration-200"
                  style={{ backgroundColor: formData.color }}
                ></div>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-16 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700 transition-colors duration-200"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-6 h-6 rounded border-2 transition-colors duration-200 ${
                      formData.color === color ? 'border-gray-600 dark:border-gray-400' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !formData.name.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {submitting ? 'Saving...' : editingCategory ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="text-center py-8">
          <TagIcon className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4 transition-colors duration-200" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-200">No categories yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-200">Create your first category to organize your items.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors duration-200">{category.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => startEdit(category)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                  title="Edit category"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                  title="Delete category"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 